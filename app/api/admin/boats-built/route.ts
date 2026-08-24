import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.SUPABASE_URL
const supabaseSecretKey = process.env.SUPABASE_SECRET_KEY

const BUCKET = 'boats_built'
const TABLE = 'boats_built'

function getAdminClient() {
  if (!supabaseUrl || !supabaseSecretKey) {
    throw new Error(
      'Missing SUPABASE_URL or SUPABASE_SECRET_KEY environment variables.'
    )
  }

  return createClient(
    supabaseUrl,
    supabaseSecretKey,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  )
}

/* =========================
   POST - ADD BOAT
========================= */

export async function POST(request: NextRequest) {
  try {
    const supabaseAdmin = getAdminClient()

    const formData = await request.formData()

    const file = formData.get('file')
    const featuredValue = formData.get('featured')

    if (!(file instanceof File)) {
      return NextResponse.json(
        {
          error: 'No boat image was provided.',
        },
        { status: 400 }
      )
    }

    const featured = featuredValue === 'true'

    const extension =
      file.name.split('.').pop()?.toLowerCase() || 'jpg'

    const fileName =
      `boat-${Date.now()}-${Math.random()
        .toString(36)
        .substring(2, 10)}.${extension}`

    const fileBuffer = await file.arrayBuffer()

    const { error: uploadError } =
      await supabaseAdmin.storage
        .from(BUCKET)
        .upload(fileName, fileBuffer, {
          contentType: file.type || 'image/jpeg',
          upsert: false,
        })

    if (uploadError) {
      console.error('Image upload error:', uploadError)

      return NextResponse.json(
        {
          error: uploadError.message,
        },
        { status: 500 }
      )
    }

    const {
      data: publicUrlData,
    } = supabaseAdmin.storage
      .from(BUCKET)
      .getPublicUrl(fileName)

    const imageUrl = publicUrlData.publicUrl

    const {
      data,
      error: insertError,
    } = await supabaseAdmin
      .from(TABLE)
      .insert({
        image_url: imageUrl,
        featured,
        name: null,
        type: null,
        description: null,
      })
      .select(
        'id,image_url,name,type,description,featured,created_at'
      )

    if (insertError) {
      console.error(
        'Database insert error:',
        insertError
      )

      await supabaseAdmin.storage
        .from(BUCKET)
        .remove([fileName])

      return NextResponse.json(
        {
          error: insertError.message,
        },
        { status: 500 }
      )
    }

    return NextResponse.json(
      {
        success: true,
        boat: data?.[0] || null,
      },
      { status: 201 }
    )
  } catch (error: any) {
    console.error('POST boats-built error:', error)

    return NextResponse.json(
      {
        error:
          error?.message ||
          'Failed to add boat.',
      },
      { status: 500 }
    )
  }
}

/* =========================
   PATCH - EDIT BOAT
========================= */

export async function PATCH(request: NextRequest) {
  try {
    const supabaseAdmin = getAdminClient()

    const body = await request.json()

    const id = Number(body.id)

    if (!id || Number.isNaN(id)) {
      return NextResponse.json(
        {
          error: 'A valid boat ID is required.',
        },
        { status: 400 }
      )
    }

    const name =
      typeof body.name === 'string'
        ? body.name.trim()
        : ''

    const type =
      typeof body.type === 'string'
        ? body.type.trim()
        : ''

    const description =
      typeof body.description === 'string'
        ? body.description.trim()
        : ''

    const featured =
      body.featured === true

    if (!name) {
      return NextResponse.json(
        {
          error: 'Please enter a boat name.',
        },
        { status: 400 }
      )
    }

    if (!type) {
      return NextResponse.json(
        {
          error: 'Please enter a boat type.',
        },
        { status: 400 }
      )
    }

    /*
     * IMPORTANT:
     * We intentionally DO NOT use .single().
     * Supabase returns an array here.
     */

    const {
      data,
      error,
    } = await supabaseAdmin
      .from(TABLE)
      .update({
        name,
        type,
        description: description || null,
        featured,
      })
      .eq('id', id)
      .select(
        'id,image_url,name,type,description,featured,created_at'
      )

    if (error) {
      console.error(
        'Database update error:',
        error
      )

      return NextResponse.json(
        {
          error: error.message,
        },
        { status: 500 }
      )
    }

    if (!data || data.length === 0) {
      return NextResponse.json(
        {
          error:
            `No boat was updated for ID ${id}.`,
        },
        { status: 404 }
      )
    }

    return NextResponse.json(
      {
        success: true,
        boat: data[0],
      },
      { status: 200 }
    )
  } catch (error: any) {
    console.error(
      'PATCH boats-built error:',
      error
    )

    return NextResponse.json(
      {
        error:
          error?.message ||
          'Failed to update boat.',
      },
      { status: 500 }
    )
  }
}

/* =========================
   DELETE - DELETE BOAT
========================= */

export async function DELETE(request: NextRequest) {
  try {
    const supabaseAdmin = getAdminClient()

    const body = await request.json()

    const id = Number(body.id)

    if (!id || Number.isNaN(id)) {
      return NextResponse.json(
        {
          error: 'A valid boat ID is required.',
        },
        { status: 400 }
      )
    }

    /*
     * Find the boat first
     */

    const {
      data: boat,
      error: findError,
    } = await supabaseAdmin
      .from(TABLE)
      .select('id,image_url')
      .eq('id', id)
      .maybeSingle()

    if (findError) {
      console.error(
        'Find boat error:',
        findError
      )

      return NextResponse.json(
        {
          error: findError.message,
        },
        { status: 500 }
      )
    }

    if (!boat) {
      return NextResponse.json(
        {
          error:
            `Boat with ID ${id} was not found.`,
        },
        { status: 404 }
      )
    }

    /*
     * Delete image
     */

    if (boat.image_url) {
      const marker =
        `/storage/v1/object/public/${BUCKET}/`

      const position =
        boat.image_url.indexOf(marker)

      if (position !== -1) {
        const filePath =
          boat.image_url.substring(
            position + marker.length
          )

        const {
          error: storageError,
        } =
          await supabaseAdmin.storage
            .from(BUCKET)
            .remove([filePath])

        if (storageError) {
          console.error(
            'Storage delete error:',
            storageError
          )
        }
      }
    }

    /*
     * Delete database row
     */

    const {
      data: deletedBoat,
      error: deleteError,
    } = await supabaseAdmin
      .from(TABLE)
      .delete()
      .eq('id', id)
      .select('id')

    if (deleteError) {
      console.error(
        'Database delete error:',
        deleteError
      )

      return NextResponse.json(
        {
          error: deleteError.message,
        },
        { status: 500 }
      )
    }

    if (
      !deletedBoat ||
      deletedBoat.length === 0
    ) {
      return NextResponse.json(
        {
          error:
            `Boat with ID ${id} could not be deleted.`,
        },
        { status: 404 }
      )
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Boat deleted successfully.',
      },
      { status: 200 }
    )
  } catch (error: any) {
    console.error(
      'DELETE boats-built error:',
      error
    )

    return NextResponse.json(
      {
        error:
          error?.message ||
          'Failed to delete boat.',
      },
      { status: 500 }
    )
  }
}
