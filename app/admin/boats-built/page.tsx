'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

type BoatBuilt = {
  id: number
  image_url: string | null
  name: string | null
  type: string | null
  description: string | null
  featured: boolean | null
  created_at: string
}

export default function BoatsBuiltAdminPage() {
  const [boats, setBoats] = useState<BoatBuilt[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)

  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [featured, setFeatured] = useState(false)

  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const [editingId, setEditingId] = useState<number | null>(null)
  const [editName, setEditName] = useState('')
  const [editType, setEditType] = useState('')
  const [editDescription, setEditDescription] = useState('')
  const [editFeatured, setEditFeatured] = useState(false)

  const [savingEdit, setSavingEdit] = useState(false)
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [testingDatabase, setTestingDatabase] = useState(false)

  useEffect(() => {
    loadBoats()
  }, [])

  async function loadBoats() {
    setLoading(true)
    setError('')

    try {
      const { data, error } = await supabase
        .from('boats_built')
        .select(
          'id,image_url,name,type,description,featured,created_at'
        )
        .order('created_at', {
          ascending: false,
        })

      if (error) {
        console.error('LOAD ERROR:', error)
        throw error
      }

      setBoats((data || []) as BoatBuilt[])
    } catch (err: any) {
      console.error('LOAD BOATS ERROR:', err)

      setError(
        err?.message ||
          'Failed to load boats.'
      )

      setBoats([])
    } finally {
      setLoading(false)
    }
  }

  /*
   * DATABASE CONNECTION TEST
   *
   * This checks what the website itself can see
   * inside boats_built.
   */
  async function testDatabase() {
    setTestingDatabase(true)
    setMessage('')
    setError('')

    try {
      const {
        data,
        error,
      } = await supabase
        .from('boats_built')
        .select('id,name,type')
        .eq('id', 1)

      console.log(
        'WEBSITE SUPABASE TEST:',
        {
          data,
          error,
        }
      )

      if (error) {
        throw error
      }

      if (!data || data.length === 0) {
        setError(
          'The website connected to Supabase, but it cannot see boat ID 1.'
        )

        return
      }

      const boat = data[0]

      setMessage(
        `Database connection works. ID 1 is currently "${boat.name}" (${boat.type}).`
      )
    } catch (err: any) {
      console.error(
        'DATABASE TEST ERROR:',
        err
      )

      setError(
        err?.message ||
          'Database connection test failed.'
      )
    } finally {
      setTestingDatabase(false)
    }
  }

  function handleFileChange(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const file =
      event.target.files?.[0]

    if (!file) return

    setSelectedFile(file)

    if (preview) {
      URL.revokeObjectURL(preview)
    }

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
      const formData =
        new FormData()

      formData.append(
        'file',
        selectedFile
      )

      formData.append(
        'featured',
        String(featured)
      )

      const response =
        await fetch(
          '/api/admin/boats-built',
          {
            method: 'POST',
            body: formData,
          }
        )

      const result =
        await response.json()

      if (!response.ok) {
        throw new Error(
          result?.error ||
            'Failed to upload boat.'
        )
      }

      clearSelectedFile()

      setMessage(
        'Boat picture uploaded successfully.'
      )

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
    setSavingEdit(false)
  }

  /*
   * SAVE EDIT
   */
  async function saveEdit(
    id: number
  ) {
    setMessage('')
    setError('')

    const name =
      editName.trim()

    const type =
      editType.trim()

    const description =
      editDescription.trim()

    if (!name) {
      setError(
        'Please enter a boat name.'
      )

      return
    }

    if (!type) {
      setError(
        'Please enter a boat type.'
      )

      return
    }

    setSavingEdit(true)

    try {
      console.log(
        'EDITING BOAT:',
        id
      )

      /*
       * STEP 1
       * Confirm that the website can see
       * the exact boat.
       */

      const {
        data: before,
        error: beforeError,
      } = await supabase
        .from('boats_built')
        .select(
          'id,name,type,description,featured'
        )
        .eq('id', id)

      console.log(
        'BEFORE UPDATE:',
        before
      )

      if (beforeError) {
        throw beforeError
      }

      if (!before || before.length === 0) {
        throw new Error(
          `Boat ID ${id} cannot be found by the website.`
        )
      }

      /*
       * STEP 2
       * UPDATE the row.
       */

      const {
        error: updateError,
      } = await supabase
        .from('boats_built')
        .update({
          name,
          type,
          description:
            description || null,
          featured:
            editFeatured,
        })
        .eq('id', id)

      if (updateError) {
        console.error(
          'UPDATE ERROR:',
          updateError
        )

        throw updateError
      }

      /*
       * STEP 3
       * Read the exact row again.
       */

      const {
        data: after,
        error: afterError,
      } = await supabase
        .from('boats_built')
        .select(
          'id,image_url,name,type,description,featured,created_at'
        )
        .eq('id', id)

      console.log(
        'AFTER UPDATE:',
        after
      )

      if (afterError) {
        throw afterError
      }

      if (!after || after.length === 0) {
        throw new Error(
          'Update completed, but the boat could not be read afterwards.'
        )
      }

      const updatedBoat =
        after[0] as BoatBuilt

      /*
       * STEP 4
       * Make absolutely sure the database
       * contains the requested values.
       */

      if (
        updatedBoat.name !== name ||
        updatedBoat.type !== type
      ) {
        throw new Error(
          `The database did not save the changes. Database currently contains "${updatedBoat.name}" / "${updatedBoat.type}".`
        )
      }

      /*
       * STEP 5
       * Update the page.
       */

      setBoats(current =>
        current.map(boat =>
          boat.id === id
            ? updatedBoat
            : boat
        )
      )

      cancelEditing()

      setMessage(
        'Boat information updated successfully.'
      )
    } catch (err: any) {
      console.error(
        'SAVE EDIT ERROR:',
        err
      )

      setError(
        err?.message ||
          'Failed to update boat.'
      )
    } finally {
      setSavingEdit(false)
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

    if (!confirmed) return

    setDeletingId(boat.id)
    setMessage('')
    setError('')

    try {
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
            await supabase.storage
              .from('boats_built')
              .remove([
                filePath,
              ])

          if (storageError) {
            console.error(
              'STORAGE DELETE ERROR:',
              storageError
            )
          }
        }
      }

      /*
       * Delete database row.
       */

      const {
        error: deleteError,
      } = await supabase
        .from('boats_built')
        .delete()
        .eq('id', boat.id)

      if (deleteError) {
        throw deleteError
      }

      setBoats(current =>
        current.filter(
          item =>
            item.id !== boat.id
        )
      )

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

      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5 mb-10">

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

        <div className="flex flex-wrap gap-3">

          <button
            type="button"
            onClick={testDatabase}
            disabled={testingDatabase}
            className="bg-purple-600 hover:bg-purple-700 px-5 py-3 rounded-xl font-semibold transition disabled:opacity-50"
          >
            {testingDatabase
              ? 'Testing...'
              : 'Test Database'}
          </button>

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
          You can edit the boat information afterwards.
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
                : 'Tap to choose a boat picture'}
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

            <div className="flex items-center justify-between mb-3">

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
              Featured boats can appear on the DATA MARINE homepage.
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
                  className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden hover:border-slate-700 transition"
                >

                  {/* IMAGE */}

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

                  {/* CONTENT */}

                  <div className="p-5">

                    {editingId ===
                    boat.id ? (

                      <div>

                        <div className="flex items-center justify-between mb-4">

                          <h3 className="font-bold text-lg">
                            Edit Boat
                          </h3>

                          <span className="text-xs text-blue-400 bg-blue-950 border border-blue-800 px-2 py-1 rounded-full">
                            #{boat.id}
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
                          placeholder="Boat Description"
                          rows={4}
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
                              savingEdit
                            }
                            className="bg-blue-600 hover:bg-blue-700 py-3 rounded-lg font-semibold transition disabled:opacity-50"
                          >
                            {savingEdit
                              ? 'Saving...'
                              : 'Save Changes'}
                          </button>

                          <button
                            type="button"
                            onClick={
                              cancelEditing
                            }
                            disabled={
                              savingEdit
                            }
                            className="bg-slate-800 hover:bg-slate-700 py-3 rounded-lg font-semibold transition disabled:opacity-50"
                          >
                            Cancel
                          </button>

                        </div>

                      </div>

                    ) : (

                      <>

                        <div className="flex items-start justify-between gap-3">

                          <div>

                            {boat.featured && (
                              <span className="inline-block bg-yellow-400 text-black px-2.5 py-1 rounded-full text-xs font-bold mb-3">
                                ★ Featured
                              </span>
                            )}

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
                            className="bg-blue-600 hover:bg-blue-700 py-3 rounded-lg font-semibold transition"
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
                            className="bg-red-950 hover:bg-red-900 border border-red-800 text-red-300 py-3 rounded-lg font-semibold transition disabled:opacity-50"
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
