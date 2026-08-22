import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabaseAdmin = createClient(
  supabaseUrl,
  supabaseServiceKey
)

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()

    const file = formData.get('file') as File | null
    const featured =
      formData.get('featured') === 'true'

    if (!file) {
      return NextResponse.json(
        { error: 'No image file provided.' },
        { status: 400 }
      )
    }

    const allowedTypes = [
      'image/png',
      'image/jpeg',
      'image/jpg',
      'image/webp',
    ]

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        {
          error:
            'Only PNG, JPG, JPEG and WEBP images are allowed.',
        },
        { status: 400 }
      )
    }

    const maxSize = 10 * 1024 * 1024

    if (file.size > maxSize) {
      return NextResponse.json(
        {
          error:
            'Image is too large. Maximum size is 10MB.',
        },
        { status: 400 }
      )
    }

    const fileExtension =
      file.name.split('.').pop()?.toLowerCase() ||
      'jpg'

    const fileName = `${Date.now()}-${crypto.randomUUID()}.${fileExtension}`

    const filePath = fileName

    const fileBuffer = Buffer.from(
      await file.arrayBuffer()
    )

    const { error: uploadError } =
      await supabaseAdmin.storage
        .from('boats_built')
        .upload(filePath, fileBuffer, {
          contentType: file.type,
          upsert: false,
        })

    if (uploadError) {
      console.error(
        'Storage upload error:',
        uploadError
      )

      return NextResponse.json(
        {
          error:
            'Failed to upload boat image: ' +
            uploadError.message,
        },
        { status: 500 }
      )
    }

    const {
      data: publicUrlData,
    } =
      supabaseAdmin.storage
        .from('boats_built')
        .getPublicUrl(filePath)

    const imageUrl =
      publicUrlData.publicUrl

    const { data, error: insertError } =
      await supabaseAdmin
        .from('boats_built')
        .insert({
          image_url: imageUrl,
          featured,
          name: null,
          description: null,
          type: null,

          // New boat-build fields
          boat_id: null,
          engine_id: null,
          addons: [],
          total_price: 0,
        })
        .select()
        .single()

    if (insertError) {
      console.error(
        'Database insert error:',
        insertError
      )

      // Try to remove uploaded image
      await supabaseAdmin.storage
        .from('boats_built')
        .remove([filePath])

      return NextResponse.json(
        {
          error:
            'Failed to save boat: ' +
            insertError.message,
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
      'POST /api/admin/boats-built error:',
      error
    )

    return NextResponse.json(
      {
        error:
          error?.message ||
          'Something went wrong while uploading the boat.',
      },
      { status: 500 }
    )
  }
}


export async function DELETE(
  request: NextRequest
) {
  try {
    const body = await request.json()

    const id = Number(body?.id)

    if (!id || Number.isNaN(id)) {
      return NextResponse.json(
        {
          error: 'A valid boat ID is required.',
        },
        { status: 400 }
      )
    }

    // Get the boat first so we can find its image
    const { data: boat, error: fetchError } =
      await supabaseAdmin
        .from('boats_built')
        .select('id, image_url')
        .eq('id', id)
        .single()

    if (fetchError) {
      return NextResponse.json(
        {
          error:
            'Boat not found: ' +
            fetchError.message,
        },
        { status: 404 }
      )
    }

    // Delete image from storage
    let warning = ''

    if (boat.image_url) {
      const marker =
        '/storage/v1/object/public/boats_built/'

      const position =
        boat.image_url.indexOf(marker)

      if (position !== -1) {
        const filePath =
          boat.image_url.substring(
            position + marker.length
          )

        const { error: storageError } =
          await supabaseAdmin.storage
            .from('boats_built')
            .remove([filePath])

        if (storageError) {
          console.error(
            'Storage deletion error:',
            storageError
          )

          warning =
            'The database record was deleted, but the image could not be removed from storage.'
        }
      }
    }

    // Delete database record
    const { error: deleteError } =
      await supabaseAdmin
        .from('boats_built')
        .delete()
        .eq('id', id)

    if (deleteError) {
      console.error(
        'Database deletion error:',
        deleteError
      )

      return NextResponse.json(
        {
          error:
            'Failed to delete boat: ' +
            deleteError.message,
        },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Boat deleted successfully.',
      ...(warning ? { warning } : {}),
    })
  } catch (error: any) {
    console.error(
      'DELETE /api/admin/boats-built error:',
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
