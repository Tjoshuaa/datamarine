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

  useEffect(() => {
    loadBoats()
  }, [])

  async function loadBoats() {
    setLoading(true)
    setError('')

    const { data, error } = await supabase
      .from('boats_built')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error(error)
      setError(error.message)
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

  function clearSelectedFile() {
    setSelectedFile(null)
    setPreview(null)
    setFeatured(false)
  }

  async function uploadBoat() {
    if (!selectedFile) {
      setError('Please select a boat picture first.')
      return
    }

    setUploading(true)
    setMessage('')
    setError('')

    try {
      const extension =
        selectedFile.name.split('.').pop()?.toLowerCase() || 'jpg'

      const fileName = `boat-${Date.now()}-${Math.random()
        .toString(36)
        .substring(2, 9)}.${extension}`

      const { error: uploadError } = await supabase.storage
        .from('boats-built')
        .upload(fileName, selectedFile, {
          cacheControl: '3600',
          upsert: false,
        })

      if (uploadError) {
        throw uploadError
      }

      const { data: publicUrlData } = supabase.storage
        .from('boats-built')
        .getPublicUrl(fileName)

      const imageUrl = publicUrlData.publicUrl

      const { error: insertError } = await supabase
        .from('boats_built')
        .insert({
          image_url: imageUrl,
          name: null,
          type: null,
          description: null,
          featured,
        })

      if (insertError) {
        throw insertError
      }

      setMessage('Boat picture uploaded successfully.')

      clearSelectedFile()

      await loadBoats()
    } catch (err: any) {
      console.error(err)

      setError(
        err?.message ||
          'Something went wrong while uploading the picture.'
      )
    } finally {
      setUploading(false)
    }
  }

  function startEditing(boat: BoatBuilt) {
    setEditingId(boat.id)
    setEditName(boat.name || '')
    setEditType(boat.type || '')
    setEditDescription(boat.description || '')
    setEditFeatured(Boolean(boat.featured))

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
    setMessage('')
    setError('')

    const { error } = await supabase
      .from('boats_built')
      .update({
        name: editName || null,
        type: editType || null,
        description: editDescription || null,
        featured: editFeatured,
      })
      .eq('id', id)

    if (error) {
      console.error(error)
      setError(error.message)
      return
    }

    setMessage('Boat information updated successfully.')

    cancelEditing()

    await loadBoats()
  }

  async function deleteBoat(boat: BoatBuilt) {
    const confirmed = window.confirm(
      'Are you sure you want to delete this boat?'
    )

    if (!confirmed) return

    setMessage('')
    setError('')

    try {
      if (boat.image_url) {
        const marker =
          '/storage/v1/object/public/boats-built/'

        const position = boat.image_url.indexOf(marker)

        if (position !== -1) {
          const filePath = boat.image_url.substring(
            position + marker.length
          )

          await supabase.storage
            .from('boats-built')
            .remove([filePath])
        }
      }

      const { error: deleteError } = await supabase
        .from('boats_built')
        .delete()
        .eq('id', boat.id)

      if (deleteError) {
        throw deleteError
      }

      setMessage('Boat deleted successfully.')

      await loadBoats()
    } catch (err: any) {
      console.error(err)

      setError(
        err?.message ||
          'Failed to delete boat.'
      )
    }
  }

  return (
    <main className="min-h-screen bg-black text-white p-6 md:p-10">

      {/* HEADER */}

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5 mb-10">

        <div>

          <p className="text-sm uppercase tracking-[0.25em] text-blue-400">
            DATA MARINE
          </p>

          <h1 className="text-4xl md:text-5xl font-bold mt-2">
            Boats We've Built
          </h1>

          <p className="text-gray-400 mt-2">
            Showcase boats built by DATA MARINE.
          </p>

        </div>

        <button
          onClick={loadBoats}
          disabled={loading}
          className="bg-slate-900 border border-slate-700 hover:border-blue-500 px-5 py-3 rounded-xl font-semibold disabled:opacity-50"
        >
          {loading ? 'Refreshing...' : '↻ Refresh'}
        </button>

      </div>


      {/* MESSAGES */}

      {message && (
        <div className="max-w-4xl mb-6 bg-green-950 border border-green-800 text-green-300 rounded-xl p-4">
          {message}
        </div>
      )}

      {error && (
        <div className="max-w-4xl mb-6 bg-red-950 border border-red-800 text-red-300 rounded-xl p-4">
          {error}
        </div>
      )}


      {/* UPLOAD */}

      <section className="max-w-4xl bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8 mb-12">

        <h2 className="text-2xl font-bold">
          Add Boat
        </h2>

        <p className="text-gray-500 mt-2 mb-6">
          Upload a picture now. You can add the boat name,
          type and description later.
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
            onChange={handleFileChange}
            className="hidden"
          />

        </label>


        {/* PREVIEW */}

        {preview && (

          <div className="mt-6">

            <div className="flex items-center justify-between mb-3">

              <h3 className="font-semibold">
                Preview
              </h3>

              <button
                onClick={clearSelectedFile}
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


        {/* FEATURED */}

        <label className="flex items-center gap-3 mt-6 cursor-pointer">

          <input
            type="checkbox"
            checked={featured}
            onChange={e => setFeatured(e.target.checked)}
            className="w-5 h-5"
          />

          <span className="font-semibold">
            Featured boat
          </span>

        </label>


        <button
          onClick={uploadBoat}
          disabled={!selectedFile || uploading}
          className="w-full mt-6 bg-blue-600 hover:bg-blue-700 py-4 rounded-xl font-bold disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {uploading
            ? 'Uploading...'
            : 'Upload Boat Picture'}
        </button>

      </section>


      {/* BOAT GALLERY */}

      <section>

        <div className="mb-6">

          <h2 className="text-2xl font-bold">
            Your Boats
          </h2>

          <p className="text-gray-500 mt-1">
            {boats.length} boat
            {boats.length === 1 ? '' : 's'}
          </p>

        </div>


        {loading && boats.length === 0 && (

          <div className="text-center py-16 text-gray-500">
            Loading...
          </div>

        )}


        {!loading && boats.length === 0 && (

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

            {boats.map(boat => (

              <div
                key={boat.id}
                className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden"
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

                      <h3 className="font-bold text-lg mb-4">
                        Edit Boat
                      </h3>

                      <input
                        value={editName}
                        onChange={e => setEditName(e.target.value)}
                        placeholder="Boat Name"
                        className="w-full bg-black border border-slate-700 rounded-lg p-3 mb-3"
                      />

                      <input
                        value={editType}
                        onChange={e => setEditType(e.target.value)}
                        placeholder="Boat Type"
                        className="w-full bg-black border border-slate-700 rounded-lg p-3 mb-3"
                      />

                      <textarea
                        value={editDescription}
                        onChange={e => setEditDescription(e.target.value)}
                        placeholder="Boat Description"
                        rows={4}
                        className="w-full bg-black border border-slate-700 rounded-lg p-3 mb-3 resize-none"
                      />

                      <label className="flex items-center gap-3 mb-5">

                        <input
                          type="checkbox"
                          checked={editFeatured}
                          onChange={e =>
                            setEditFeatured(e.target.checked)
                          }
                          className="w-5 h-5"
                        />

                        <span>
                          Featured
                        </span>

                      </label>

                      <div className="grid grid-cols-2 gap-3">

                        <button
                          onClick={() =>
                            saveEdit(boat.id)
                          }
                          className="bg-blue-600 hover:bg-blue-700 py-3 rounded-lg font-semibold"
                        >
                          Save
                        </button>

                        <button
                          onClick={cancelEditing}
                          className="bg-slate-800 hover:bg-slate-700 py-3 rounded-lg font-semibold"
                        >
                          Cancel
                        </button>

                      </div>

                    </div>

                  ) : (

                    <>

                      {boat.featured && (

                        <span className="inline-block bg-yellow-400 text-black px-2 py-1 rounded text-xs font-bold mb-3">
                          Featured
                        </span>

                      )}

                      <h3 className="font-bold text-lg">
                        {boat.name ||
                          'Boat Built by DATA MARINE'}
                      </h3>

                      {boat.type && (
                        <p className="text-gray-400 text-sm mt-1">
                          {boat.type}
                        </p>
                      )}

                      {boat.description && (
                        <p className="text-gray-500 text-sm mt-3">
                          {boat.description}
                        </p>
                      )}

                      <div className="grid grid-cols-2 gap-3 mt-5">

                        <button
                          onClick={() =>
                            startEditing(boat)
                          }
                          className="bg-blue-600 hover:bg-blue-700 py-3 rounded-lg font-semibold"
                        >
                          ✏️ Edit
                        </button>

                        <button
                          onClick={() =>
                            deleteBoat(boat)
                          }
                          className="bg-red-950 hover:bg-red-900 border border-red-800 text-red-300 py-3 rounded-lg font-semibold"
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

    </main>
  )
}
