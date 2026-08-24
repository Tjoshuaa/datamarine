import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl) {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL')
}

if (!serviceRoleKey) {
  throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY')
}

const supabaseAdmin = createClient(
  supabaseUrl,
  serviceRoleKey,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
)

/*
|--------------------------------------------------------------------------
| GET
|--------------------------------------------------------------------------
| Load all completed boats.
*/

export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from('boats_built')
      .select(
        'id,created_at,image_url,name,description,featured,type,boat_id,engine_id,addons,total_price'
      )
      .order('created_at', {
        ascending: false,
      })

    if (error) {
      console.error('GET boats_built error:', error)

      return NextResponse.json(
        {
          error: error.message,
        },
        {
          status: 500,
        }
      )
    }

    return NextResponse.json({
      boats: data || [],
    })
  } catch (error: any) {
    console.error('GET boats_built exception:', error)

    return NextResponse.json(
      {
        error:
          error?.message ||
          'Failed to load boats.',
      },
      {
        status: 500,
      }
    )
  }
}

/*
|--------------------------------------------------------------------------
| POST
|--------------------------------------------------------------------------
| Upload a completed boat image.
|--------------------------------------------------------------------------
*/

export async function POST(
  request: NextRequest
) {
  try {
    const formData =
      await request.formData()

    const file =
      formData.get('file')

    const featuredValue =
      formData.get('featured')

    if (!(file instanceof File)) {
      return NextResponse.json(
        {
          error:
            'No boat image was provided.',
        },
        {
          status: 400,
        }
      )
    }

    const featured =
      featuredValue === 'true'

    const extension =
      file.name.split('.').pop()?.toLowerCase() ||
      'jpg'

    const fileName =
      `${Date.now()}-${Math.random()
        .toString(36)
        .substring(2)}.${extension}`

    const filePath =
      `completed-boats/${fileName}`

    const arrayBuffer =
      await file.arrayBuffer()

    const buffer =
      Buffer.from(arrayBuffer)

    const {
      error: uploadError,
    } = await supabaseAdmin.storage
      .from('boats_built')
      .upload(
        filePath,
        buffer,
        {
          contentType:
            file.type ||
            'image/jpeg',
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
            uploadError.message,
        },
        {
          status: 500,
        }
      )
    }

    const {
      data: publicUrlData,
    } =
      supabaseAdmin.storage
        .from('boats_built')
        .getPublicUrl(
          filePath
        )

    const imageUrl =
      publicUrlData.publicUrl

    const {
      data: boat,
      error: insertError,
    } = await supabaseAdmin
      .from('boats_built')
      .insert({
        image_url: imageUrl,
        featured,
        name: null,
        type: null,
        description: null,
        addons: {},
        total_price: 0,
      })
      .select(
        'id,created_at,image_url,name,description,featured,type,boat_id,engine_id,addons,total_price'
      )
      .single()

    if (insertError) {
      console.error(
        'Insert boats_built error:',
        insertError
      )

      // Remove uploaded image if database insert fails.
      await supabaseAdmin.storage
        .from('boats_built')
        .remove([
          filePath,
        ])

      return NextResponse.json(
        {
          error:
            insertError.message,
        },
        {
          status: 500,
        }
      )
    }

    return NextResponse.json({
      success: true,
      boat,
    })
  } catch (error: any) {
    console.error(
      'POST boats_built exception:',
      error
    )

    return NextResponse.json(
      {
        error:
          error?.message ||
          'Failed to upload boat.',
      },
      {
        status: 500,
      }
    )
  }
}

/*
|--------------------------------------------------------------------------
| PATCH
|--------------------------------------------------------------------------
| Edit boat information.
|--------------------------------------------------------------------------
*/

export async function PATCH(
  request: NextRequest
) {
  try {
    const body =
      await request.json()

    const id =
      Number(body.id)

    if (!id || Number.isNaN(id)) {
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
            'Boat name is required.',
        },
        {
          status: 400,
        }
      )
    }

    if (!type) {
      return NextResponse.json(
        {
          error:
            'Boat type is required.',
        },
        {
          status: 400,
        }
      )
    }

    /*
     * First confirm the boat exists.
     */

    const {
      data: existingBoat,
      error: findError,
    } = await supabaseAdmin
      .from('boats_built')
      .select('id')
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
            findError.message,
        },
        {
          status: 500,
        }
      )
    }

    if (!existingBoat) {
      return NextResponse.json(
        {
          error:
            `No boat exists with ID ${id}.`,
        },
        {
          status: 404,
        }
      )
    }

    /*
     * Update using the server-side Supabase
     * service-role client.
     */

    const {
      data: updatedBoat,
      error: updateError,
    } = await supabaseAdmin
      .from('boats_built')
      .update({
        name,
        type,
        description:
          description || null,
        featured,
      })
      .eq('id', id)
      .select(
        'id,created_at,image_url,name,description,featured,type,boat_id,engine_id,addons,total_price'
      )
      .maybeSingle()

    if (updateError) {
      console.error(
        'Update boats_built error:',
        updateError
      )

      return NextResponse.json(
        {
          error:
            updateError.message,
        },
        {
          status: 500,
        }
      )
    }

    if (!updatedBoat) {
      return NextResponse.json(
        {
          error:
            `No boat was updated for ID ${id}.`,
        },
        {
          status: 500,
        }
      )
    }

    return NextResponse.json({
      success: true,
      boat: updatedBoat,
    })
  } catch (error: any) {
    console.error(
      'PATCH boats_built exception:',
      error
    )

    return NextResponse.json(
      {
        error:
          error?.message ||
          'Failed to update boat.',
      },
      {
        status: 500,
      }
    )
  }
}

/*
|--------------------------------------------------------------------------
| DELETE
|--------------------------------------------------------------------------
| Delete boat and its image.
|--------------------------------------------------------------------------
*/

export async function DELETE(
  request: NextRequest
) {
  try {
    const body =
      await request.json()

    const id =
      Number(body.id)

    if (!id || Number.isNaN(id)) {
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

    const {
      data: boat,
      error: findError,
    } = await supabaseAdmin
      .from('boats_built')
      .select(
        'id,image_url'
      )
      .eq('id', id)
      .maybeSingle()

    if (findError) {
      return NextResponse.json(
        {
          error:
            findError.message,
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
            `No boat exists with ID ${id}.`,
        },
        {
          status: 404,
        }
      )
    }

    /*
     * Delete database record.
     */

    const {
      error: deleteError,
    } = await supabaseAdmin
      .from('boats_built')
      .delete()
      .eq('id', id)

    if (deleteError) {
      console.error(
        'Delete boat error:',
        deleteError
      )

      return NextResponse.json(
        {
          error:
            deleteError.message,
        },
        {
          status: 500,
        }
      )
    }

    /*
     * Delete image from storage.
     */

    if (boat.image_url) {
      const marker =
        '/storage/v1/object/public/boats_built/'

      const position =
        boat.image_url.indexOf(
          marker
        )

      if (position !== -1) {
        const filePath =
          boat.image_url.substring(
            position +
              marker.length
          )

        const {
          error: storageError,
        } =
          await supabaseAdmin.storage
            .from('boats_built')
            .remove([
              filePath,
            ])

        if (storageError) {
          console.error(
            'Storage delete error:',
            storageError
          )
        }
      }
    }

    return NextResponse.json({
      success: true,
      message:
        'Boat deleted successfully.',
    })
  } catch (error: any) {
    console.error(
      'DELETE boats_built exception:',
      error
    )

    return NextResponse.json(
      {
        error:
          error?.message ||
          'Failed to delete boat.',
      },
      {
        status: 500,
      }
    )
  }
}
