import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL!

const serviceRoleKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabaseAdmin = createClient(
  supabaseUrl,
  serviceRoleKey
)

const BUCKET_NAME = 'boats_built'

export async function POST(
  request: NextRequest
) {
  try {
    const adminAuth =
      request.cookies.get('admin_auth')?.value

    if (adminAuth !== 'true') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const formData = await request.formData()

    const file =
      formData.get('file') as File | null

    const featured =
      formData.get('featured') === 'true'

    if (!file) {
      return NextResponse.json(
        { error: 'No image provided.' },
        { status: 400 }
      )
    }

    const extension =
      file.name
        .split('.')
        .pop()
        ?.toLowerCase() || 'jpg'

    const fileName =
      `boat-${Date.now()}-${Math.random()
        .toString(36)
        .substring(2, 9)}.${extension}`

    const arrayBuffer =
      await file.arrayBuffer()

    const buffer =
      Buffer.from(arrayBuffer)

    const { error: uploadError } =
      await supabaseAdmin.storage
        .from(BUCKET_NAME)
        .upload(
          fileName,
          buffer,
          {
            contentType:
              file.type || 'image/jpeg',
            cacheControl: '3600',
            upsert: false,
          }
        )

    if (uploadError) {
      return NextResponse.json(
        { error: uploadError.message },
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

    const { data, error: insertError } =
      await supabaseAdmin
        .from('boats_built')
        .insert({
          image_url: imageUrl,
          name: null,
          type: null,
          description: null,
          featured,
        })
        .select()
        .single()

    if (insertError) {
      await supabaseAdmin.storage
        .from(BUCKET_NAME)
        .remove([fileName])

      return NextResponse.json(
        { error: insertError.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      boat: data,
    })

  } catch (error: any) {
    console.error(
      'Boats built upload error:',
      error
    )

    return NextResponse.json(
      {
        error:
          error?.message ||
          'Upload failed.',
      },
      { status: 500 }
    )
  }
}
