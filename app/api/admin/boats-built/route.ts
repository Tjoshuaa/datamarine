import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl) {
  throw new Error('NEXT_PUBLIC_SUPABASE_URL is missing')
}

if (!supabaseServiceKey) {
  throw new Error('SUPABASE_SERVICE_ROLE_KEY is missing')
}

const supabaseAdmin = createClient(
  supabaseUrl,
  supabaseServiceKey
)

const BUCKET_NAME = 'boats_built'

export async function POST(request: Request) {
  try {
    const formData = await request.formData()

    const file = formData.get('file')
    const featuredValue = formData.get('featured')

    if (!(file instanceof File)) {
      return NextResponse.json(
        { error: 'No image file was provided.' },
        { status: 400 }
      )
    }

    const featured =
      featuredValue === 'true'

    const extension =
      file.name
        .split('.')
        .pop()
        ?.toLowerCase() || 'jpg'

    const fileName =
      `boat-${Date.now()}-${Math.random()
        .toString(36)
        .substring(2, 9)}.${extension}`

    const fileBuffer = Buffer.from(
      await file.arrayBuffer()
    )

    const { error: uploadError } =
      await supabaseAdmin.storage
        .from(BUCKET_NAME)
        .upload(
          fileName,
          fileBuffer,
          {
            contentType:
              file.type || 'image/jpeg',
            cacheControl: '3600',
            upsert: false,
          }
        )

    if (uploadError) {
      console.error(
        'Storage upload error:',
        uploadError
      )

      return NextResponse.json(
        {
          error:
            uploadError.message ||
            'Failed to upload image.',
        },
        { status: 500 }
      )
    }

    const {
      data: publicUrlData,
    } = supabaseAdmin.storage
      .from(BUCKET_NAME)
      .getPublicUrl(fileName)

    const imageUrl =
      publicUrlData.publicUrl

    const { error: insertError } =
      await supabaseAdmin
        .from('boats_built')
        .insert({
          image_url: imageUrl,
          name: null,
          type: null,
          description: null,
          featured,
        })

    if (insertError) {
      console.error(
        'Database insert error:',
        insertError
      )

      // Remove uploaded image if database insert fails
      await supabaseAdmin.storage
        .from(BUCKET_NAME)
        .remove([fileName])

      return NextResponse.json(
        {
          error:
            insertError.message ||
            'Failed to save boat.',
        },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      imageUrl,
    })
  } catch (error) {
    console.error(
      'Boats Built API error:',
      error
    )

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Something went wrong.',
      },
      { status: 500 }
    )
  }
}
