import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

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

/**
 * ADD BOAT
 */
export async function POST(request: Request) {
  try {
    const formData = await request.formData()

    const file = formData.get('file')
    const featuredValue = formData.get('featured')

    if (!(file instanceof File)) {
      return NextResponse.json(
        {
          error: 'No image file was provided.',
        },
        {
          status: 400,
        }
      )
    }

    const featured = featuredValue === 'true'

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

    /**
     * Upload image to Supabase Storage
     */
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
        {
          status: 500,
        }
      )
    }

    /**
     * Get public image URL
     */
    const {
      data: publicUrlData,
    } = supabaseAdmin.storage
      .from(BUCKET_NAME)
      .getPublicUrl(fileName)

    const imageUrl =
      publicUrlData.publicUrl

    /**
     * Save boat in database
     */
    const {
      error: insertError,
    } = await supabaseAdmin
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

      /**
       * If database insert fails,
       * remove the uploaded image.
       */
      await supabaseAdmin.storage
        .from(BUCKET_NAME)
        .remove([fileName])

      return NextResponse.json(
        {
          error:
            insertError.message ||
            'Failed to save boat.',
        },
        {
          status: 500,
        }
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
      {
        status: 500,
      }
    )
  }
}

/**
 * DELETE BOAT
 */
export async function DELETE(
  request: Request
) {
  try {
    const body = await request.json()

    const id = Number(body?.id)

    if (
      !Number.isInteger(id) ||
      id <= 0
    ) {
      return NextResponse.json(
        {
          error:
            'A valid boat ID is required.',
        },
        {
          status: 400,
        }
      )
    }

    /**
     * First get the boat so we know
     * exactly which image belongs to it.
     */
    const {
      data: boat,
      error: findError,
    } = await supabaseAdmin
      .from('boats_built')
      .select(
        'id, image_url'
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
        {
          status: 500,
        }
      )
    }

    if (!boat) {
      return NextResponse.json(
        {
          error:
            'Boat was not found or has already been deleted.',
        },
        {
          status: 404,
        }
      )
    }

    /**
     * DELETE DATABASE RECORD
     *
     * This uses the Supabase service-role client,
     * so browser RLS permissions cannot silently
     * prevent the deletion.
     */
    const {
      data: deletedBoat,
      error: deleteError,
    } = await supabaseAdmin
      .from('boats_built')
      .delete()
      .eq('id', id)
      .select(
        'id, image_url'
      )
      .maybeSingle()

    if (deleteError) {
      console.error(
        'Database delete error:',
        deleteError
      )

      return NextResponse.json(
        {
          error:
            deleteError.message ||
            'Failed to delete boat from database.',
        },
        {
          status: 500,
        }
      )
    }

    if (!deletedBoat) {
      return NextResponse.json(
        {
          error:
            'Boat could not be deleted from the database.',
        },
        {
          status: 500,
        }
      )
    }

    /**
     * DELETE IMAGE FROM SUPABASE STORAGE
     */
    const imageUrl =
      deletedBoat.image_url ||
      boat.image_url

    if (imageUrl) {
      const marker =
        `/storage/v1/object/public/${BUCKET_NAME}/`

      const position =
        imageUrl.indexOf(marker)

      if (position !== -1) {
        const filePath =
          decodeURIComponent(
            imageUrl.substring(
              position + marker.length
            )
          )

        const {
          error: storageError,
        } = await supabaseAdmin.storage
          .from(BUCKET_NAME)
          .remove([
            filePath,
          ])

        if (storageError) {
          console.error(
            'Storage delete error:',
            storageError
          )

          /**
           * Database record is already deleted.
           * Return success with a warning because
           * the boat itself is gone.
           */
          return NextResponse.json({
            success: true,
            deletedId:
              deletedBoat.id,
            warning:
              'Boat was deleted, but its image file could not be removed.',
          })
        }
      }
    }

    /**
     * EVERYTHING SUCCESSFUL
     */
    return NextResponse.json({
      success: true,
      deletedId:
        deletedBoat.id,
      message:
        'Boat and image deleted successfully.',
    })
  } catch (error) {
    console.error(
      'Boats Built DELETE API error:',
      error
    )

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Something went wrong while deleting the boat.',
      },
      {
        status: 500,
      }
    )
  }
}
