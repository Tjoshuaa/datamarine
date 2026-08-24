'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

type BoatBuilt = {
  id: number
  created_at: string
  image_url: string | null
  name: string | null
  description: string | null
  featured: boolean | null
  type: string | null
  boat_id: number | null
  engine_id: number | null
  addons: any
  total_price: number
}

export default function BoatsBuiltAdminPage() {
  const [boats, setBoats] = useState<BoatBuilt[]>([])
  const [loading, setLoading] = useState(true)

  const [selectedFile, setSelectedFile] =
    useState<File | null>(null)

  const [preview, setPreview] =
    useState<string | null>(null)

  const [featured, setFeatured] =
    useState(false)

  const [uploading, setUploading] =
    useState(false)

  const [editingId, setEditingId] =
    useState<number | null>(null)

  const [editName, setEditName] =
    useState('')

  const [editType, setEditType] =
    useState('')

  const [editDescription, setEditDescription] =
    useState('')

  const [editFeatured, setEditFeatured] =
    useState(false)

  const [saving, setSaving] =
    useState(false)

  const [deletingId, setDeletingId] =
    useState<number | null>(null)

  const [message, setMessage] =
    useState('')

  const [error, setError] =
    useState('')

  const [supabaseUser, setSupabaseUser] =
    useState<string | null>(null)

  useEffect(() => {
    checkSupabaseSession()
    loadBoats()
  }, [])

  async function checkSupabaseSession() {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser()

    console.log(
      'DATA MARINE SUPABASE USER:',
      user
    )

    if (error) {
      console.error(
        'Supabase session error:',
        error
      )

      setSupabaseUser(null)
      return
    }

    setSupabaseUser(
      user?.email || user?.id || null
    )
  }

  async function loadBoats() {
    setLoading(true)
    setError('')

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      console.log(
        'LOAD - SUPABASE USER:',
        user
      )

      const { data, error } = await supabase
        .from('boats_built')
        .select('*')
        .order('created_at', {
          ascending: false,
        })

      if (error) {
        console.error(
          'LOAD BOATS ERROR:',
          error
        )

        throw error
      }

      console.log(
        'BOATS FROM DATABASE:',
        data
      )

      setBoats(
        (data || []) as BoatBuilt[]
      )
    } catch (err: any) {
      console.error(
        'LOAD ERROR:',
        err
      )

      setError(
        err?.message ||
          'Failed to load boats.'
      )

      setBoats([])
    } finally {
      setLoading(false)
    }
  }

  function handleFileChange(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const file =
      event.target.files?.[0]

    if (!file) return

    if (preview) {
      URL.revokeObjectURL(preview)
    }

    setSelectedFile(file)
    setPreview(
      URL.createObjectURL(file)
    )

    setMessage('')
    setError('')
  }

  function clearSelectedFile() {
    if (preview) {
      URL.revokeObjectURL(preview)
    }

    setSelectedFile(null)
    setPreview(null)
    setFeatured(false)
  }

  async function uploadBoat() {
    if (!selectedFile) {
      setError(
        'Please select a boat picture first.'
      )
      return
    }

    setUploading(true)
    setMessage('')
    setError('')

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      console.log(
        'UPLOAD - SUPABASE USER:',
        user
      )

      const extension =
        selectedFile.name
          .split('.')
          .pop() || 'jpg'

      const fileName =
        `${Date.now()}-${Math.random()
          .toString(36)
          .substring(2)}.${extension}`

      const {
        error: storageError,
      } = await supabase.storage
        .from('boats_built')
        .upload(
          fileName,
          selectedFile,
          {
            cacheControl: '3600',
            upsert: false,
          }
        )

      if (storageError) {
        throw storageError
      }

      const {
        data: publicUrlData,
      } =
        supabase.storage
          .from('boats_built')
          .getPublicUrl(
            fileName
          )

      const imageUrl =
        publicUrlData.publicUrl

      const {
        data,
        error: insertError,
      } =
        await supabase
          .from('boats_built')
          .insert({
            image_url: imageUrl,
            featured,
            name: null,
            type: null,
            description: null,
            boat_id: null,
            engine_id: null,
            addons: {},
            total_price: 0,
          })
          .select('*')

      if (insertError) {
        throw insertError
      }

      console.log(
        'INSERT RESULT:',
        data
      )

      setMessage(
        'Boat uploaded successfully.'
      )

      clearSelectedFile()

      await loadBoats()
    } catch (err: any) {
      console.error(
        'UPLOAD ERROR:',
        err
      )

      setError(
        err?.message ||
          'Failed to upload boat.'
      )
    } finally {
      setUploading(false)
    }
  }

  function startEditing(
    boat: BoatBuilt
  ) {
    setEditingId(boat.id)

    setEditName(
      boat.name || ''
    )

    setEditType(
      boat.type || ''
    )

    setEditDescription(
      boat.description || ''
    )

    setEditFeatured(
      Boolean(boat.featured)
    )

    setMessage('')
    setError('')
  }

  function cancelEditing() {
    setEditingId(null)
    setEditName('')
    setEditType('')
    setEditDescription('')
    setEditFeatured(false)
  }

  async function saveEdit(
    id: number
  ) {
    const name =
      editName.trim()

    const type =
      editType.trim()

    const description =
      editDescription.trim()

    if (!name) {
      setError(
        'Boat name is required.'
      )
      return
    }

    if (!type) {
      setError(
        'Boat type is required.'
      )
      return
    }

    setSaving(true)
    setMessage('')
    setError('')

    try {
      /*
       * Check the real Supabase session.
       */

      const {
        data: { user },
        error: userError,
      } =
        await supabase.auth.getUser()

      console.log(
        'SAVE - SUPABASE USER:',
        user
      )

      if (userError) {
        throw userError
      }

      if (!user) {
        throw new Error(
          'You are not signed into Supabase. Your DATA MARINE admin login is separate from your Supabase login.'
        )
      }

      const updateData = {
        name,
        type,
        description:
          description || null,
        featured:
          editFeatured,
      }

      console.log(
        'UPDATING BOAT:',
        id
      )

      console.log(
        'UPDATE DATA:',
        updateData
      )

      /*
       * Update the row.
       *
       * We intentionally do NOT use .single().
       */

      const {
        data,
        error: updateError,
      } =
        await supabase
          .from('boats_built')
          .update(updateData)
          .eq('id', id)
          .select('*')

      console.log(
        'UPDATE RESPONSE:',
        {
          data,
          updateError,
        }
      )

      if (updateError) {
        throw updateError
      }

      /*
       * Supabase returning zero rows means
       * the authenticated browser session could
       * not update this row.
       */

      if (
        !data ||
        data.length === 0
      ) {
        throw new Error(
          `No boat was updated for ID ${id}. Supabase returned 0 rows.`
        )
      }

      const updatedBoat =
        data[0] as BoatBuilt

      console.log(
        'UPDATED BOAT:',
        updatedBoat
      )

      /*
       * Update the screen immediately.
       */

      setBoats(current =>
        current.map(boat =>
          boat.id === id
            ? updatedBoat
            : boat
        )
      )

      /*
       * Exit edit mode.
       */

      cancelEditing()

      setMessage(
        `Boat "${updatedBoat.name}" updated successfully.`
      )

      /*
       * Verify against the actual database.
       */

      const {
        data: verifyData,
        error: verifyError,
      } =
        await supabase
          .from('boats_built')
          .select(
            'id,name,type,description,featured'
          )
          .eq('id', id)

      console.log(
        'DATABASE VERIFICATION:',
        {
          verifyData,
          verifyError,
        }
      )

      if (verifyError) {
        console.error(
          'Verification error:',
          verifyError
        )
        return
      }

      if (
        !verifyData ||
        verifyData.length === 0
      ) {
        throw new Error(
          'The update completed but the database verification returned no boat.'
        )
      }

      /*
       * Reload everything from Supabase.
       */

      await loadBoats()
    } catch (err: any) {
      console.error(
        'SAVE EDIT ERROR:',
        err
      )

      setError(
        err?.message ||
          'Failed to save boat information.'
      )
    } finally {
      setSaving(false)
    }
  }

  async function deleteBoat(
    boat: BoatBuilt
  ) {
    const confirmed =
      window.confirm(
        `Are you sure you want to permanently delete "${
          boat.name ||
          'this boat'
        }"?`
      )

    if (!confirmed) {
      return
    }

    setDeletingId(boat.id)
    setMessage('')
    setError('')

    try {
      const {
        data: { user },
      } =
        await supabase.auth.getUser()

      console.log(
        'DELETE - SUPABASE USER:',
        user
      )

      if (!user) {
        throw new Error(
          'You are not signed into Supabase.'
        )
      }

      const {
        error: deleteError,
      } =
        await supabase
          .from('boats_built')
          .delete()
          .eq('id', boat.id)

      if (deleteError) {
        throw deleteError
      }

      /*
       * Remove from local UI.
       */

      setBoats(current =>
        current.filter(
          item =>
            item.id !== boat.id
        )
      )

      /*
       * Remove image from storage.
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
            error:
              storageError,
          } =
            await supabase.storage
              .from('boats_built')
              .remove([
                filePath,
              ])

          if (storageError) {
            console.error(
              'Storage delete warning:',
              storageError
            )
          }
        }
      }

      setMessage(
        'Boat deleted successfully.'
      )
    } catch (err: any) {
      console.error(
        'DELETE ERROR:',
        err
      )

      setError(
        err?.message ||
          'Failed to delete boat.'
      )
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <main className="min-h-screen bg-black text-white p-6 md:p-10">

      {/* HEADER */}

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5 mb-10">

        <div>

          <p className="text-sm uppercase tracking-[0.25em] text-blue-400 font-semibold">
            DATA MARINE
          </p>

          <h1 className="text-4xl md:text-5xl font-bold mt-2">
            Boats We've Built
          </h1>

          <p className="text-gray-400 mt-2">
            Manage completed boats showcased by DATA MARINE.
          </p>

        </div>

        <button
          type="button"
          onClick={loadBoats}
          disabled={loading}
          className="bg-slate-900 border border-slate-700 hover:border-blue-500 px-5 py-3 rounded-xl font-semibold transition disabled:opacity-50"
        >
          {loading
            ? 'Refreshing...'
            : '↻ Refresh'}
        </button>

      </div>

      {/* SUPABASE STATUS */}

      <div className="mb-6 max-w-5xl">

        {supabaseUser ? (

          <div className="bg-green-950 border border-green-800 text-green-300 rounded-xl p-4">

            <div className="font-semibold">
              ✓ Supabase authenticated
            </div>

            <div className="text-sm mt-1 text-green-400/80">
              {supabaseUser}
            </div>

          </div>

        ) : (

          <div className="bg-orange-950 border border-orange-800 text-orange-300 rounded-xl p-4">

            <div className="font-semibold">
              ⚠ Supabase authentication not detected
            </div>

            <div className="text-sm mt-1 text-orange-400/80">
              Your DATA MARINE admin login may not be connected to Supabase Auth.
            </div>

          </div>

        )}

      </div>

      {/* MESSAGES */}

      {message && (
        <div className="max-w-5xl mb-6 bg-green-950 border border-green-800 text-green-300 rounded-xl p-4">
          {message}
        </div>
      )}

      {error && (
        <div className="max-w-5xl mb-6 bg-red-950 border border-red-800 text-red-300 rounded-xl p-4">
          {error}
        </div>
      )}

      {/* ADD BOAT */}

      <section className="max-w-5xl bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8 mb-12">

        <p className="text-blue-400 text-sm uppercase tracking-widest font-semibold">
          Completed Project
        </p>

        <h2 className="text-2xl font-bold mt-1">
          Add Boat
        </h2>

        <p className="text-gray-500 mt-2 mb-6">
          Upload a completed boat picture.
          You can edit its information afterwards.
        </p>

        <label
          htmlFor="boat-picture"
          className="flex flex-col items-center justify-center min-h-56 border-2 border-dashed border-slate-700 hover:border-blue-500 rounded-xl cursor-pointer bg-black transition"
        >

          <div className="text-center p-6">

            <div className="text-5xl mb-4">
              🚤
            </div>

            <p className="font-semibold">
              {selectedFile
                ? selectedFile.name
                : 'Choose a boat picture'}
            </p>

            <p className="text-sm text-gray-500 mt-2">
              PNG, JPG, JPEG or WEBP
            </p>

          </div>

          <input
            id="boat-picture"
            type="file"
            accept="image/png,image/jpeg,image/jpg,image/webp"
            onChange={
              handleFileChange
            }
            className="hidden"
          />

        </label>

        {preview && (

          <div className="mt-6">

            <div className="flex justify-between mb-3">

              <h3 className="font-semibold">
                Preview
              </h3>

              <button
                type="button"
                onClick={
                  clearSelectedFile
                }
                className="text-red-400 hover:text-red-300 text-sm"
              >
                Remove
              </button>

            </div>

            <div className="rounded-xl overflow-hidden border border-slate-800 bg-black">

              <img
                src={preview}
                alt="Boat preview"
                className="w-full max-h-[450px] object-contain"
              />

            </div>

          </div>

        )}

        <label className="flex items-center gap-3 mt-6 cursor-pointer">

          <input
            type="checkbox"
            checked={featured}
            onChange={e =>
              setFeatured(
                e.target.checked
              )
            }
            className="w-5 h-5 accent-blue-600"
          />

          <div>

            <span className="font-semibold">
              Feature this boat
            </span>

            <p className="text-sm text-gray-500">
              Show this boat in the homepage featured section.
            </p>

          </div>

        </label>

        <button
          type="button"
          onClick={
            uploadBoat
          }
          disabled={
            !selectedFile ||
            uploading
          }
          className="w-full mt-6 bg-blue-600 hover:bg-blue-700 py-4 rounded-xl font-bold transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {uploading
            ? 'Uploading...'
            : 'Upload Boat Picture'}
        </button>

      </section>

      {/* BOATS */}

      <section>

        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-6">

          <div>

            <p className="text-blue-400 text-sm uppercase tracking-widest font-semibold">
              Portfolio
            </p>

            <h2 className="text-2xl font-bold mt-1">
              Your Boats
            </h2>

            <p className="text-gray-500 mt-1">
              {boats.length} boat
              {boats.length === 1
                ? ''
                : 's'}
            </p>

          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl px-4 py-3">

            <span className="text-gray-500 text-sm">
              Featured
            </span>

            <span className="text-blue-400 font-bold ml-2">
              {
                boats.filter(
                  boat =>
                    boat.featured
                ).length
              }
            </span>

          </div>

        </div>

        {loading &&
          boats.length === 0 && (
            <div className="text-center py-16 text-gray-500">
              Loading boats...
            </div>
          )}

        {!loading &&
          boats.length === 0 && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center">

              <div className="text-6xl mb-4">
                🚤
              </div>

              <h3 className="text-xl font-bold">
                No boats yet
              </h3>

              <p className="text-gray-500 mt-2">
                Upload your first completed boat above.
              </p>

            </div>
          )}

        {boats.length > 0 && (

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">

            {boats.map(
              boat => (

                <div
                  key={boat.id}
                  className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden"
                >

                  <div className="aspect-[4/3] bg-black">

                    {boat.image_url ? (

                      <img
                        src={
                          boat.image_url
                        }
                        alt={
                          boat.name ||
                          'Boat built by DATA MARINE'
                        }
                        className="w-full h-full object-cover"
                      />

                    ) : (

                      <div className="h-full flex items-center justify-center text-gray-600">
                        No image
                      </div>

                    )}

                  </div>

                  <div className="p-5">

                    {editingId ===
                    boat.id ? (

                      <div>

                        <div className="flex justify-between items-center mb-5">

                          <h3 className="font-bold text-lg">
                            Edit Boat
                          </h3>

                          <span className="text-xs text-blue-400">
                            ID #{boat.id}
                          </span>

                        </div>

                        <label className="block text-sm text-gray-400 mb-2">
                          Boat Name
                        </label>

                        <input
                          value={
                            editName
                          }
                          onChange={e =>
                            setEditName(
                              e.target.value
                            )
                          }
                          placeholder="Boat Name"
                          className="w-full bg-black border border-slate-700 focus:border-blue-500 outline-none rounded-lg p-3 mb-4"
                        />

                        <label className="block text-sm text-gray-400 mb-2">
                          Boat Type
                        </label>

                        <input
                          value={
                            editType
                          }
                          onChange={e =>
                            setEditType(
                              e.target.value
                            )
                          }
                          placeholder="Boat Type"
                          className="w-full bg-black border border-slate-700 focus:border-blue-500 outline-none rounded-lg p-3 mb-4"
                        />

                        <label className="block text-sm text-gray-400 mb-2">
                          Description
                        </label>

                        <textarea
                          value={
                            editDescription
                          }
                          onChange={e =>
                            setEditDescription(
                              e.target.value
                            )
                          }
                          rows={4}
                          placeholder="Boat description"
                          className="w-full bg-black border border-slate-700 focus:border-blue-500 outline-none rounded-lg p-3 mb-4 resize-none"
                        />

                        <label className="flex items-center gap-3 mb-5 cursor-pointer">

                          <input
                            type="checkbox"
                            checked={
                              editFeatured
                            }
                            onChange={e =>
                              setEditFeatured(
                                e.target.checked
                              )
                            }
                            className="w-5 h-5 accent-blue-600"
                          />

                          <span className="font-semibold">
                            Featured Boat
                          </span>

                        </label>

                        <div className="grid grid-cols-2 gap-3">

                          <button
                            type="button"
                            onClick={() =>
                              saveEdit(
                                boat.id
                              )
                            }
                            disabled={
                              saving
                            }
                            className="bg-blue-600 hover:bg-blue-700 py-3 rounded-lg font-semibold disabled:opacity-50"
                          >
                            {saving
                              ? 'Saving...'
                              : 'Save Changes'}
                          </button>

                          <button
                            type="button"
                            onClick={
                              cancelEditing
                            }
                            disabled={
                              saving
                            }
                            className="bg-slate-800 hover:bg-slate-700 py-3 rounded-lg font-semibold disabled:opacity-50"
                          >
                            Cancel
                          </button>

                        </div>

                      </div>

                    ) : (

                      <>

                        {boat.featured && (

                          <span className="inline-block bg-yellow-400 text-black px-2.5 py-1 rounded-full text-xs font-bold mb-3">
                            ★ Featured
                          </span>

                        )}

                        <div className="flex justify-between gap-3">

                          <div>

                            <h3 className="font-bold text-xl">
                              {boat.name ||
                                'Boat Built by DATA MARINE'}
                            </h3>

                            {boat.type && (
                              <p className="text-blue-400 text-sm font-semibold mt-1">
                                {boat.type}
                              </p>
                            )}

                          </div>

                          <span className="text-slate-600 text-xs">
                            #{boat.id}
                          </span>

                        </div>

                        {boat.description ? (

                          <p className="text-gray-500 text-sm mt-4 leading-6">
                            {boat.description}
                          </p>

                        ) : (

                          <p className="text-gray-600 text-sm mt-4 italic">
                            No description added yet.
                          </p>

                        )}

                        <div className="grid grid-cols-2 gap-3 mt-6">

                          <button
                            type="button"
                            onClick={() =>
                              startEditing(
                                boat
                              )
                            }
                            className="bg-blue-600 hover:bg-blue-700 py-3 rounded-lg font-semibold"
                          >
                            ✏️ Edit
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              deleteBoat(
                                boat
                              )
                            }
                            disabled={
                              deletingId ===
                              boat.id
                            }
                            className="bg-red-950 hover:bg-red-900 border border-red-800 text-red-300 py-3 rounded-lg font-semibold disabled:opacity-50"
                          >
                            {deletingId ===
                            boat.id
                              ? 'Deleting...'
                              : '🗑️ Delete'}
                          </button>

                        </div>

                      </>

                    )}

                  </div>

                </div>

              )
            )}

          </div>

        )}

      </section>

    </main>
  )
}
