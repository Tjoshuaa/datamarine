import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.SUPABASE_URL
const supabaseSecretKey = process.env.SUPABASE_SECRET_KEY

if (!supabaseUrl || !supabaseSecretKey) {
  throw new Error(
    'Missing SUPABASE_URL or SUPABASE_SECRET_KEY environment variables.'
  )
}

const supabaseAdmin = createClient(
  supabaseUrl,
  supabaseSecretKey,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
)

const BUCKET = 'boats_built'
const TABLE = 'boats_built'

/*
|--------------------------------------------------------------------------
| POST — Upload a completed boat
|--------------------------------------------------------------------------
*/

export async function POST(request: NextRequest) {
  try {
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

    const featured =
      featuredValue === 'true'

    const extension =
      file.name.split('.').pop()?.toLowerCase() || 'jpg'

    const fileName =
      `boat-${Date.now()}-${Math.random()
        .toString(36)
        .substring(2, 10)}.${extension}`

    const filePath = fileName

    const fileBuffer = await file.arrayBuffer()

    /*
     * Upload image
     */

    const { error: uploadError } =
      await supabaseAdmin.storage
        .from(BUCKET)
        .upload(
          filePath,
          fileBuffer,
          {
            contentType:
              file.type || 'image/jpeg',
            upsert: false,
          }
        )

    if (uploadError) {
      console.error(
        'Boat image upload error:',
        uploadError
      )

      return NextResponse.json(
        {
          error:
            uploadError.message ||
            'Failed to upload boat image.',
        },
        { status: 500 }
      )
    }

    /*
     * Get public image URL
     */

    const {
      data: publicUrlData,
    } =
      supabaseAdmin.storage
        .from(BUCKET)
        .getPublicUrl(filePath)

    const imageUrl =
      publicUrlData.publicUrl

    /*
     * Insert boat record
     */

    const { data, error: insertError } =
      await supabaseAdmin
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
        .single()

    if (insertError) {
      console.error(
        'Boat database insert error:',
        insertError
      )

      /*
       * Remove uploaded image if
       * database insert fails.
       */

      await supabaseAdmin.storage
        .from(BUCKET)
        .remove([filePath])

      return NextResponse.json(
        {
          error:
            insertError.message ||
            'Failed to save boat information.',
        },
        { status: 500 }
      )
    }

    return NextResponse.json(
      {
        success: true,
        boat: data,
      },
      { status: 201 }
    )
  } catch (error: any) {
    console.error(
      'POST boats-built error:',
      error
    )

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

/*
|--------------------------------------------------------------------------
| PATCH — Edit boat
|--------------------------------------------------------------------------
*/

export async function PATCH(
  request: NextRequest
) {
  try {
    const body = await request.json()

    const id = Number(body.id)

    if (!id || Number.isNaN(id)) {
      return NextResponse.json(
        {
          error:
            'A valid boat ID is required.',
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
      Boolean(body.featured)

    if (!name) {
      return NextResponse.json(
        {
          error:
            'Please enter a boat name.',
        },
        { status: 400 }
      )
    }

    if (!type) {
      return NextResponse.json(
        {
          error:
            'Please enter a boat type.',
        },
        { status: 400 }
      )
    }

    /*
     * Update using the Supabase
     * server-side secret key.
     *
     * This bypasses the client's
     * RLS authentication problem.
     */

    const {
      data,
      error: updateError,
    } = await supabaseAdmin
      .from(TABLE)
      .update({
        name,
        type,
        description:
          description || null,
        featured,
      })
      .eq('id', id)
      .select(
        'id,image_url,name,type,description,featured,created_at'
      )

    if (updateError) {
      console.error(
        'Boat update error:',
        updateError
      )

      return NextResponse.json(
        {
          error:
            updateError.message ||
            'Failed to update boat.',
        },
        { status: 500 }
      )
    }

    /*
     * Important:
     *
     * Do NOT use .single() here.
     *
     * If the ID doesn't exist,
     * Supabase returns an empty array
     * instead of throwing the
     * "Cannot coerce the result to a
     * single JSON object" error.
     */

    if (!data || data.length === 0) {
      return NextResponse.json(
        {
          error:
            `No boat was updated for ID ${id}. The boat does not exist in the boats_built table.`,
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

/*
|--------------------------------------------------------------------------
| DELETE — Delete completed boat
|--------------------------------------------------------------------------
*/

export async function DELETE(
  request: NextRequest
) {
  try {
    const body = await request.json()

    const id = Number(body.id)

    if (!id || Number.isNaN(id)) {
      return NextResponse.json(
        {
          error:
            'A valid boat ID is required.',
        },
        { status: 400 }
      )
    }

    /*
     * First get the boat so we can
     * remove its image from storage.
     */

    const {
      data: boat,
      error: findError,
    } = await supabaseAdmin
      .from(TABLE)
      .select(
        'id,image_url'
      )
      .eq('id', id)
      .maybeSingle()

    if (findError) {
      console.error(
        'Find boat error:',
        findError
      )

      return NextResponse.json(
        {
          error:
            findError.message ||
            'Failed to find boat.',
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
     * Delete image from storage
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
     * Delete database record
     */

    const {
      data: deletedBoat,
      error: deleteError,
    } =
      await supabaseAdmin
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
          error:
            deleteError.message ||
            'Failed to delete boat.',
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
        message:
          'Boat deleted successfully.',
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
