'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

type BoatBuilt = {
  id: number
  image_url: string
  name: string | null
  type: string | null
  description: string | null
  featured: boolean
  created_at: string
}

export default function BoatBuildsAdminPage() {
  const [boats, setBoats] = useState<BoatBuilt[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)

  const [image, setImage] = useState<File | null>(null)
  const [preview, setPreview] = useState('')

  const [featured, setFeatured] = useState(false)

  const [editingId, setEditingId] = useState<number | null>(null)
  const [editName, setEditName] = useState('')
  const [editType, setEditType] = useState('')
  const [editDescription, setEditDescription] = useState('')
  const [editFeatured, setEditFeatured] = useState(false)

  const [message, setMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    loadBoats()
  }, [])

  async function loadBoats() {
    setLoading(true)
    setErrorMessage('')

    const { data, error } = await supabase
      .from('boats_built')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error(error)
      setErrorMessage(error.message)
      setBoats([])
    } else {
      setBoats(data || [])
    }

    setLoading(false)
  }

  function handleImage(
    e: React.ChangeEvent<HTMLInputElement>
  ) {
    const file = e.target.files?.[0]

    if (!file) return

    setImage(file)
    setPreview(URL.createObjectURL(file))

    setMessage('')
    setErrorMessage('')
  }

  function clearUpload() {
    setImage(null)
    setPreview('')
    setFeatured(false)
  }

  async function uploadBoat() {
    if (!image) {
      setErrorMessage('Please select a boat picture first.')
      return
    }

    setUploading(true)
    setMessage('')
    setErrorMessage('')

    try {
      const extension =
        image.name.split('.').pop()?.toLowerCase() || 'jpg'

      const fileName =
        `${Date.now()}-${Math.random()
          .toString(36)
          .substring(2)}.${extension}`

      const filePath = `boat-${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('boats-built')
        .upload(filePath, image, {
          cacheControl: '3600',
          upsert: false,
        })

      if (uploadError) {
        throw uploadError
      }

      const { data: publicUrlData } = supabase.storage
        .from('boats-built')
        .getPublicUrl(filePath)

      const imageUrl = publicUrlData.publicUrl

      const { error: insertError } = await supabase
        .from('boats_built')
        .insert({
          image_url: imageUrl,
          name: null,
          type: null,
          description: null,
          featured: featured,
        })

      if (insertError) {
        throw insertError
      }

      setMessage('Boat picture uploaded successfully.')

      clearUpload()

      await loadBoats()

    } catch (error: any) {
      console.error(error)

      setErrorMessage(
        error?.message ||
        'Something went wrong while uploading the boat picture.'
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
    setEditFeatured(boat.featured || false)

    setMessage('')
    setErrorMessage('')
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
    setErrorMessage('')

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
      setErrorMessage(error.message)
      return
    }

    setMessage('Boat information updated successfully.')

    cancelEditing()

    await loadBoats()
  }

  async function deleteBoat(boat: BoatBuilt) {
    const confirmed = window.confirm(
      'Are you sure you want to delete this boat picture?'
    )

    if (!confirmed) return

    setMessage('')
    setErrorMessage('')

    try {
      const marker =
        '/storage/v1/object/public/boats-built/'

      const imageUrl = boat.image_url

      const index = imageUrl.indexOf(marker)

      if (index !== -1) {
        const filePath =
          imageUrl.substring(index + marker.length)

        const { error: storageError } =
          await supabase.storage
            .from('boats-built')
            .remove([filePath])

        if (storageError) {
          console.error(storageError)
        }
      }

      const { error } = await supabase
        .from('boats_built')
        .delete()
        .eq('id', boat.id)

      if (error) {
        throw error
      }

      setMessage('Boat picture deleted successfully.')

      await loadBoats()

    } catch (error: any) {
      console.error(error)

      setErrorMessage(
        error?.message ||
        'Failed to delete boat picture.'
      )
    }
  }

  return (
    <main className="min-h-screen bg-black text-white p-6 md:p-10">

      {/* HEADER */}

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5 mb-10">

        <div>

          <p className="text-sm uppercase tracking-[0.25em] text-blue-400">
            DATA MARINE ⚓
          </p>

          <h1 className="text-4xl md:text-5xl font-bold mt-2">
            Boats We've Built
          </h1>

          <p className="text-gray-400 mt-2">
            Upload pictures of boats built by DATA MARINE.
          </p>

        </div>

        <button
          onClick={loadBoats}
          disabled={loading}
          className="bg-slate-900 border border-slate-700 hover:border-blue-500 px-5 py-3 rounded-xl font-semibold transition disabled:opacity-50"
        >
          {loading ? 'Refreshing...' : '↻ Refresh'}
        </button>

      </div>


      {/* SUCCESS */}

      {message && (
        <div className="max-w-4xl mb-6 bg-green-950/50 border border-green-800 text-green-300 rounded-xl p-4">
          {message}
        </div>
      )}


      {/* ERROR */}

      {errorMessage && (
        <div className="max-w-4xl mb-6 bg-red-950/50 border border-red-800 text-red-300 rounded-xl p-4">
          {errorMessage}
        </div>
      )}


      {/* UPLOAD SECTION */}

      <section className="max-w-4xl bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8 mb-12">

        <h2 className="text-2xl font-bold">
          Add Boat Picture
        </h2>

        <p className="text-gray-500 mt-2 mb-7">
          Upload a picture now. You can add the boat name,
          type and description later.
        </p>


        <label
          htmlFor="boat-image"
          className="flex flex-col items-center justify-center min-h-52 border-2 border-dashed border-slate-700 hover:border-blue-500 rounded-xl cursor-pointer bg-black transition"
        >

          <div className="text-center p-6">

            <div className="text-5xl mb-4">
              🖼️
            </div>

            <p className="font-semibold">
              {image
                ? image.name
                : 'Tap here to choose a boat picture'}
            </p>

            <p className="text-sm text-gray-500 mt-2">
              JPG, JPEG, PNG or WEBP
            </p>

          </div>

          <input
            id="boat-image"
            type="file"
            accept="image/png,image/jpeg,image/jpg,image/webp"
            onChange={handleImage}
            className="hidden"
          />

        </label>


        {/* PREVIEW */}

        {preview && (

          <div className="mt-6">

            <div className="flex justify-between items-center mb-3">

              <h3 className="font-semibold">
                Picture Preview
              </h3>

              <button
                onClick={clearUpload}
                className="text-red-400 hover:text-red-300 text-sm"
              >
                Remove
              </button>

            </div>

            <div className="bg-black border border-slate-800 rounded-xl overflow-hidden">

              <img
                src={preview}
                alt="Boat preview"
                className="w-full max-h-[450px] object-contain"
              />

            </div>

          </div>

        )}


        {/* FEATURED */}

        <label className="flex items-center gap-4 mt-6 bg-black border border-slate-800 rounded-xl p-5 cursor-pointer">

          <input
            type="checkbox"
            checked={featured}
            onChange={e => setFeatured(e.target.checked)}
            className="w-5 h-5 accent-blue-600"
          />

          <div>

            <p className="font-semibold">
              Featured Boat
            </p>

            <p className="text-sm text-gray-500">
              Highlight this boat in the gallery.
            </p>

          </div>

        </label>


        {/* UPLOAD BUTTON */}

        <button
          onClick={uploadBoat}
          disabled={uploading || !image}
          className="w-full mt-6 bg-blue-600 hover:bg-blue-700 py-4 rounded-xl font-bold transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {uploading
            ? 'Uploading Picture...'
            : 'Upload Boat Picture'}
        </button>

      </section>


      {/* GALLERY */}

      <section>

        <div className="mb-6">

          <h2 className="text-2xl font-bold">
            Boat Gallery
          </h2>

          <p className="text-gray-500 mt-1">
            {boats.length} boat
            {boats.length === 1 ? '' : 's'} uploaded
          </p>

        </div>


        {loading && boats.length === 0 && (

          <div className="text-center py-20 text-gray-500">
            Loading boat gallery...
          </div>

        )}


        {!loading && boats.length === 0 && (

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center">

            <div className="text-6xl mb-5">
              🚤
            </div>

            <h3 className="text-xl font-bold">
              No boats uploaded yet
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

                <div className="relative aspect-[4/3] bg-black">

                  <img
                    src={boat.image_url}
                    alt={
                      boat.name ||
                      'Boat built by DATA MARINE'
                    }
                    className="w-full h-full object-cover"
                  />

                  {boat.featured && (

                    <span className="absolute top-4 left-4 bg-yellow-400 text-black px-3 py-1 rounded-full text-xs font-bold">
                      Featured
                    </span>

                  )}

                </div>


                {/* EDIT */}

                {editingId === boat.id ? (

                  <div className="p-5">

                    <h3 className="font-bold text-lg mb-5">
                      Edit Boat Information
                    </h3>


                    <input
                      value={editName}
                      onChange={e => setEditName(e.target.value)}
                      placeholder="Boat Name"
                      className="w-full bg-black border border-slate-700 rounded-lg p-3 mb-3 text-white"
                    />


                    <input
                      value={editType}
                      onChange={e => setEditType(e.target.value)}
                      placeholder="Boat Type"
                      className="w-full bg-black border border-slate-700 rounded-lg p-3 mb-3 text-white"
                    />


                    <textarea
                      value={editDescription}
                      onChange={e => setEditDescription(e.target.value)}
                      placeholder="Boat Description"
                      rows={4}
                      className="w-full bg-black border border-slate-700 rounded-lg p-3 mb-3 text-white resize-none"
                    />


                    <label className="flex items-center gap-3 mb-5">

                      <input
                        type="checkbox"
                        checked={editFeatured}
                        onChange={e =>
                          setEditFeatured(e.target.checked)
                        }
                        className="w-5 h-5 accent-blue-600"
                      />

                      <span>
                        Featured Boat
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

                  <div className="p-5">

                    <p className="text-blue-400 text-sm font-semibold">
                      DATA MARINE ⚓
                    </p>

                    <h3 className="font-bold text-lg mt-2">
                      {boat.name ||
                        'Boat Built by DATA MARINE'}
                    </h3>


                    {boat.type && (

                      <p className="text-gray-400 text-sm mt-1">
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

                  </div>

                )}

              </div>

            ))}

          </div>

        )}

      </section>

    </main>
  )
}
