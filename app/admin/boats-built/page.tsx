'use client'

import { useEffect, useState } from 'react'

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
  const [saving, setSaving] = useState(false)
  const [deletingId, setDeletingId] = useState<number | null>(null)

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

    try {
      const response = await fetch(
        '/api/admin/boats-built',
        {
          method: 'GET',
          cache: 'no-store',
        }
      )

      const result = await response.json()

      if (!response.ok) {
        throw new Error(
          result?.error || 'Failed to load boats.'
        )
      }

      setBoats(result.boats || [])
    } catch (err: any) {
      console.error('Load boats error:', err)

      setError(
        err?.message ||
          'Failed to load boats.'
      )

      setBoats([])
    } finally {
      setLoading(false)
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

    const name = editName.trim()
    const type = editType.trim()
    const description = editDescription.trim()

    if (!name) {
      setError('Please enter a boat name.')
      return
    }

    if (!type) {
      setError('Please enter a boat type.')
      return
    }

    setSaving(true)

    try {
      const response = await fetch(
        '/api/admin/boats-built',
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            id,
            name,
            type,
            description: description || null,
            featured: editFeatured,
          }),
        }
      )

      const result = await response.json()

      if (!response.ok) {
        throw new Error(
          result?.error ||
            'Failed to update boat.'
        )
      }

      if (!result.boat) {
        throw new Error(
          'The server did not return the updated boat.'
        )
      }

      setBoats(current =>
        current.map(boat =>
          boat.id === id
            ? result.boat
            : boat
        )
      )

      setMessage(
        'Boat information updated successfully.'
      )

      cancelEditing()
    } catch (err: any) {
      console.error(
        'Save boat error:',
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

  async function deleteBoat(boat: BoatBuilt) {
    const confirmed = window.confirm(
      `Are you sure you want to permanently delete "${
        boat.name || 'this boat'
      }"?`
    )

    if (!confirmed) return

    setMessage('')
    setError('')
    setDeletingId(boat.id)

    try {
      const response = await fetch(
        '/api/admin/boats-built',
        {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            id: boat.id,
            image_url: boat.image_url,
          }),
        }
      )

      const result = await response.json()

      if (!response.ok) {
        throw new Error(
          result?.error ||
            'Failed to delete boat.'
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

      {/* MESSAGE */}

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

      {/* BOATS */}

      <section>

        <div className="flex items-end justify-between mb-6">

          <div>
            <p className="text-blue-400 text-sm uppercase tracking-widest font-semibold">
              Portfolio
            </p>

            <h2 className="text-2xl font-bold mt-1">
              Your Boats
            </h2>

            <p className="text-gray-500 mt-1">
              {boats.length} boat
              {boats.length === 1 ? '' : 's'}
            </p>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl px-4 py-3">
            <span className="text-gray-500 text-sm">
              Featured
            </span>

            <span className="text-blue-400 font-bold ml-2">
              {
                boats.filter(
                  boat => boat.featured
                ).length
              }
            </span>
          </div>

        </div>

        {loading && boats.length === 0 && (
          <div className="text-center py-16 text-gray-500">
            Loading boats...
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
              No completed boats have been added.
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

                      <div className="flex items-center justify-between mb-5">

                        <h3 className="font-bold text-lg">
                          Edit Boat
                        </h3>

                        <span className="text-xs text-blue-400 bg-blue-950 border border-blue-800 px-2 py-1 rounded-full">
                          Editing #{boat.id}
                        </span>

                      </div>

                      {/* NAME */}

                      <label className="block text-sm text-gray-400 mb-2">
                        Boat Name
                      </label>

                      <input
                        type="text"
                        value={editName}
                        onChange={e =>
                          setEditName(
                            e.target.value
                          )
                        }
                        className="w-full bg-black border border-slate-700 focus:border-blue-500 outline-none rounded-lg p-3 mb-4"
                        placeholder="e.g. Ocean Master 28"
                      />

                      {/* TYPE */}

                      <label className="block text-sm text-gray-400 mb-2">
                        Boat Type
                      </label>

                      <input
                        type="text"
                        value={editType}
                        onChange={e =>
                          setEditType(
                            e.target.value
                          )
                        }
                        className="w-full bg-black border border-slate-700 focus:border-blue-500 outline-none rounded-lg p-3 mb-4"
                        placeholder="e.g. Speed Boat"
                      />

                      {/* DESCRIPTION */}

                      <label className="block text-sm text-gray-400 mb-2">
                        Description
                      </label>

                      <textarea
                        value={editDescription}
                        onChange={e =>
                          setEditDescription(
                            e.target.value
                          )
                        }
                        rows={4}
                        className="w-full bg-black border border-slate-700 focus:border-blue-500 outline-none rounded-lg p-3 mb-4 resize-none"
                        placeholder="Describe this completed boat..."
                      />

                      {/* FEATURED */}

                      <label className="flex items-center gap-3 mb-5 cursor-pointer">

                        <input
                          type="checkbox"
                          checked={editFeatured}
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

                      {/* BUTTONS */}

                      <div className="grid grid-cols-2 gap-3">

                        <button
                          type="button"
                          onClick={() =>
                            saveEdit(
                              boat.id
                            )
                          }
                          disabled={saving}
                          className="bg-blue-600 hover:bg-blue-700 py-3 rounded-lg font-semibold transition disabled:opacity-50"
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
                          className="bg-slate-800 hover:bg-slate-700 py-3 rounded-lg font-semibold transition disabled:opacity-50"
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

            ))}

          </div>
        )}

      </section>

    </main>
  )
}
