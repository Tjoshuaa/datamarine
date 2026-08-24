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
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)

  const [selectedFile, setSelectedFile] =
    useState<File | null>(null)

  const [preview, setPreview] =
    useState<string | null>(null)

  const [newName, setNewName] = useState('')
  const [newType, setNewType] = useState('')
  const [newDescription, setNewDescription] = useState('')
  const [newFeatured, setNewFeatured] = useState(false)

  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const [editingId, setEditingId] =
    useState<number | null>(null)

  const [editName, setEditName] = useState('')
  const [editType, setEditType] = useState('')
  const [editDescription, setEditDescription] =
    useState('')
  const [editFeatured, setEditFeatured] =
    useState(false)

  useEffect(() => {
    loadBoats()
  }, [])

  async function loadBoats() {
    setLoading(true)
    setError('')

    const { data, error } = await supabase
      .from('boats_built')
      .select(
        'id,image_url,name,type,description,featured,created_at'
      )
      .order('created_at', {
        ascending: false,
      })

    if (error) {
      console.error('Load boats error:', error)
      setError(error.message)
      setBoats([])
    } else {
      setBoats(data || [])
    }

    setLoading(false)
  }

  function handleFileChange(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const file = event.target.files?.[0]

    if (!file) return

    setSelectedFile(file)
    setPreview(URL.createObjectURL(file))

    setMessage('')
    setError('')
  }

  function clearNewBoatForm() {
    setSelectedFile(null)
    setPreview(null)
    setNewName('')
    setNewType('')
    setNewDescription('')
    setNewFeatured(false)
  }

  async function uploadBoat() {
    if (!selectedFile) {
      setError('Please select a boat picture first.')
      return
    }

    if (!newName.trim()) {
      setError('Please enter the boat name.')
      return
    }

    if (!newType.trim()) {
      setError('Please enter the boat type.')
      return
    }

    setUploading(true)
    setMessage('')
    setError('')

    try {
      const formData = new FormData()

      formData.append('file', selectedFile)
      formData.append('name', newName.trim())
      formData.append('type', newType.trim())
      formData.append(
        'description',
        newDescription.trim()
      )
      formData.append(
        'featured',
        String(newFeatured)
      )

      const response = await fetch(
        '/api/admin/boats-built',
        {
          method: 'POST',
          body: formData,
        }
      )

      const result = await response.json()

      if (!response.ok) {
        throw new Error(
          result?.error ||
            'Failed to upload boat.'
        )
      }

      setMessage(
        'Boat added successfully.'
      )

      clearNewBoatForm()

      await loadBoats()
    } catch (err: any) {
      console.error('Upload boat error:', err)

      setError(
        err?.message ||
          'Failed to upload boat.'
      )
    } finally {
      setUploading(false)
    }
  }

  function startEditing(boat: BoatBuilt) {
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

  async function saveEdit(id: number) {
    if (!editName.trim()) {
      setError('Boat name cannot be empty.')
      return
    }

    if (!editType.trim()) {
      setError('Boat type cannot be empty.')
      return
    }

    setSaving(true)
    setMessage('')
    setError('')

    try {
      const {
        data,
        error: updateError,
      } = await supabase
        .from('boats_built')
        .update({
          name: editName.trim(),
          type: editType.trim(),
          description:
            editDescription.trim() || null,
          featured: editFeatured,
        })
        .eq('id', id)
        .select(
          'id,image_url,name,type,description,featured,created_at'
        )
        .single()

      if (updateError) {
        throw updateError
      }

      if (!data) {
        throw new Error(
          'The boat was not updated. Supabase did not return an updated record. Check your Row Level Security UPDATE policy.'
        )
      }

      // Update the card immediately
      setBoats(current =>
        current.map(boat =>
          boat.id === id
            ? data
            : boat
        )
      )

      setMessage(
        'Boat information updated successfully.'
      )

      cancelEditing()
    } catch (err: any) {
      console.error(
        'Update boat error:',
        err
      )

      setError(
        err?.message ||
          'Failed to update boat.'
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
        `Are you sure you want to permanently delete "${boat.name || 'this boat'}"?`
      )

    if (!confirmed) return

    setMessage('')
    setError('')

    try {
      /*
       * Delete image from storage first.
       */
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

          const {
            error: storageError,
          } = await supabase.storage
            .from('boats_built')
            .remove([filePath])

          if (storageError) {
            console.error(
              'Storage delete error:',
              storageError
            )
          }
        }
      }

      const {
        data,
        error: deleteError,
      } = await supabase
        .from('boats_built')
        .delete()
        .eq('id', boat.id)
        .select('id')

      if (deleteError) {
        throw deleteError
      }

      if (!data || data.length === 0) {
        throw new Error(
          'The boat was not deleted. Check your Supabase DELETE policy.'
        )
      }

      setBoats(current =>
        current.filter(
          item => item.id !== boat.id
        )
      )

      setMessage(
        'Boat deleted successfully.'
      )
    } catch (err: any) {
      console.error(
        'Delete boat error:',
        err
      )

      setError(
        err?.message ||
          'Failed to delete boat.'
      )
    }
  }

  return (
    <main className="min-h-screen bg-black text-white p-6 md:p-10">

      {/* HEADER */}

      <div className="max-w-7xl mx-auto">

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5 mb-10">

          <div>

            <p className="text-sm uppercase tracking-[0.25em] text-blue-400 font-semibold">
              DATA MARINE
            </p>

            <h1 className="text-4xl md:text-5xl font-bold mt-2">
              Boats We've Built
            </h1>

            <p className="text-gray-400 mt-2">
              Manage completed DATA MARINE boat builds.
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

        {/* MESSAGES */}

        {message && (
          <div className="mb-6 bg-green-950/60 border border-green-800 text-green-300 rounded-xl p-4">
            {message}
          </div>
        )}

        {error && (
          <div className="mb-6 bg-red-950/60 border border-red-800 text-red-300 rounded-xl p-4">
            {error}
          </div>
        )}

        {/* ADD BOAT */}

        <section className="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 mb-12">

          <div className="mb-7">

            <p className="text-blue-400 text-xs uppercase tracking-[0.2em] font-semibold">
              Boat Showcase
            </p>

            <h2 className="text-2xl md:text-3xl font-bold mt-1">
              Add Completed Boat
            </h2>

            <p className="text-gray-500 mt-2">
              Add the boat information and image that
              should appear in the Boats We've Built
              showcase.
            </p>

          </div>

          <div className="grid lg:grid-cols-2 gap-8">

            {/* FORM */}

            <div className="space-y-4">

              <input
                type="text"
                value={newName}
                onChange={e =>
                  setNewName(e.target.value)
                }
                placeholder="Boat Name"
                className="w-full bg-black border border-slate-700 rounded-xl p-4 text-white outline-none focus:border-blue-500"
              />

              <input
                type="text"
                value={newType}
                onChange={e =>
                  setNewType(e.target.value)
                }
                placeholder="Boat Type"
                className="w-full bg-black border border-slate-700 rounded-xl p-4 text-white outline-none focus:border-blue-500"
              />

              <textarea
                value={newDescription}
                onChange={e =>
                  setNewDescription(
                    e.target.value
                  )
                }
                placeholder="Boat Description"
                rows={5}
                className="w-full bg-black border border-slate-700 rounded-xl p-4 text-white outline-none focus:border-blue-500 resize-none"
              />

              <label className="flex items-center gap-3 cursor-pointer">

                <input
                  type="checkbox"
                  checked={newFeatured}
                  onChange={e =>
                    setNewFeatured(
                      e.target.checked
                    )
                  }
                  className="w-5 h-5 accent-blue-600"
                />

                <span className="font-semibold">
                  Featured boat
                </span>

              </label>

            </div>

            {/* IMAGE */}

            <div>

              <label
                htmlFor="boat-picture"
                className="flex flex-col items-center justify-center min-h-64 border-2 border-dashed border-slate-700 hover:border-blue-500 rounded-2xl cursor-pointer bg-black transition"
              >

                {preview ? (
                  <img
                    src={preview}
                    alt="Boat preview"
                    className="w-full h-64 object-contain rounded-xl"
                  />
                ) : (
                  <div className="text-center p-6">

                    <div className="text-5xl mb-4">
                      🚤
                    </div>

                    <p className="font-semibold">
                      Select Boat Image
                    </p>

                    <p className="text-sm text-gray-500 mt-2">
                      PNG, JPG, JPEG or WEBP
                    </p>

                  </div>
                )}

                <input
                  id="boat-picture"
                  type="file"
                  accept="image/png,image/jpeg,image/jpg,image/webp"
                  onChange={handleFileChange}
                  className="hidden"
                />

              </label>

              {selectedFile && (
                <button
                  type="button"
                  onClick={() => {
                    setSelectedFile(null)
                    setPreview(null)
                  }}
                  className="text-red-400 hover:text-red-300 text-sm mt-3"
                >
                  Remove image
                </button>
              )}

            </div>

          </div>

          <button
            type="button"
            onClick={uploadBoat}
            disabled={
              !selectedFile ||
              uploading
            }
            className="w-full mt-8 bg-blue-600 hover:bg-blue-700 py-4 rounded-xl font-bold transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {uploading
              ? 'Adding Boat...'
              : 'Add Boat'}
          </button>

        </section>

        {/* BOATS */}

        <section>

          <div className="mb-6">

            <p className="text-blue-400 text-xs uppercase tracking-[0.2em] font-semibold">
              Your Collection
            </p>

            <h2 className="text-3xl font-bold mt-1">
              Completed Boats
            </h2>

            <p className="text-gray-500 mt-1">
              {boats.length} boat
              {boats.length === 1
                ? ''
                : 's'}
            </p>

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
                  Add your first completed boat above.
                </p>

              </div>
            )}

          {boats.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">

              {boats.map(boat => (

                <div
                  key={boat.id}
                  className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden hover:border-slate-700 transition"
                >

                  {/* IMAGE */}

                  <div className="aspect-[4/3] bg-black">

                    {boat.image_url ? (
                      <img
                        src={boat.image_url}
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

                    {editingId === boat.id ? (

                      <div>

                        <div className="flex items-center justify-between mb-4">

                          <h3 className="font-bold text-lg">
                            Edit Boat
                          </h3>

                          <button
                            type="button"
                            onClick={cancelEditing}
                            className="text-gray-500 hover:text-white"
                          >
                            ✕
                          </button>

                        </div>

                        <input
                          value={editName}
                          onChange={e =>
                            setEditName(
                              e.target.value
                            )
                          }
                          placeholder="Boat Name"
                          className="w-full bg-black border border-slate-700 rounded-lg p-3 mb-3 text-white outline-none focus:border-blue-500"
                        />

                        <input
                          value={editType}
                          onChange={e =>
                            setEditType(
                              e.target.value
                            )
                          }
                          placeholder="Boat Type"
                          className="w-full bg-black border border-slate-700 rounded-lg p-3 mb-3 text-white outline-none focus:border-blue-500"
                        />

                        <textarea
                          value={editDescription}
                          onChange={e =>
                            setEditDescription(
                              e.target.value
                            )
                          }
                          placeholder="Boat Description"
                          rows={4}
                          className="w-full bg-black border border-slate-700 rounded-lg p-3 mb-3 text-white outline-none focus:border-blue-500 resize-none"
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

                          <span>
                            Featured
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
                            disabled={saving}
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
                            disabled={saving}
                            className="bg-slate-800 hover:bg-slate-700 py-3 rounded-lg font-semibold disabled:opacity-50"
                          >
                            Cancel
                          </button>

                        </div>

                      </div>

                    ) : (

                      <>

                        {boat.featured && (
                          <span className="inline-block bg-yellow-400 text-black px-3 py-1 rounded-full text-xs font-bold mb-3">
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

                        {boat.description && (
                          <p className="text-gray-500 text-sm mt-3 line-clamp-3">
                            {boat.description}
                          </p>
                        )}

                        <div className="grid grid-cols-2 gap-3 mt-5">

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
                            className="bg-red-950 hover:bg-red-900 border border-red-800 text-red-300 py-3 rounded-lg font-semibold transition"
                          >
                            🗑️ Delete
                          </button>

                        </div>

                      </>

                    )}

                  </div>

                </div>

              ))}

            </div>
          )}

        </section>

      </div>

    </main>
  )
}
