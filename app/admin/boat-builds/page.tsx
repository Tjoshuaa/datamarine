'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

type Boat = {
  id: number
  name: string
  category: string
  capacity: string
  base_price: number
  image_url: string | null
}

export default function BoatBuildsAdminPage() {
  const [boats, setBoats] = useState<Boat[]>([])

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const [editingId, setEditingId] = useState<number | null>(null)

  const [name, setName] = useState('')
  const [category, setCategory] = useState('')
  const [capacity, setCapacity] = useState('')
  const [price, setPrice] = useState('')

  const [image, setImage] = useState<File | null>(null)
  const [preview, setPreview] = useState('')

  useEffect(() => {
    loadBoats()
  }, [])

  async function loadBoats() {
    setLoading(true)

    const { data, error } = await supabase
      .from('boats')
      .select(
        'id,name,category,capacity,base_price,image_url'
      )
      .order('id', {
        ascending: true,
      })

    if (error) {
      console.error(error)
      alert(error.message)
    }

    setBoats(data || [])

    setLoading(false)
  }

  function resetForm() {
    setEditingId(null)

    setName('')
    setCategory('')
    setCapacity('')
    setPrice('')

    setImage(null)
    setPreview('')
  }

  function handleImage(
    e: React.ChangeEvent<HTMLInputElement>
  ) {
    const file = e.target.files?.[0]

    if (!file) return

    setImage(file)

    setPreview(
      URL.createObjectURL(file)
    )
  }

  function editBoat(boat: Boat) {
    setEditingId(boat.id)

    setName(boat.name || '')
    setCategory(boat.category || '')
    setCapacity(boat.capacity || '')
    setPrice(
      String(boat.base_price || '')
    )

    setImage(null)

    setPreview(
      boat.image_url || ''
    )

    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    })
  }

  async function uploadBoatImage(
    file: File
  ) {
    const extension =
      file.name.split('.').pop() || 'jpg'

    const fileName =
      `boat-${Date.now()}.${extension}`

    const { error } =
      await supabase.storage
        .from('boats')
        .upload(
          fileName,
          file,
          {
            cacheControl: '3600',
            upsert: false,
          }
        )

    if (error) {
      throw error
    }

    const {
      data: publicUrl,
    } =
      supabase.storage
        .from('boats')
        .getPublicUrl(
          fileName
        )

    return publicUrl.publicUrl
  }

  async function saveBoat() {
    if (!name.trim()) {
      alert('Please enter the boat name.')
      return
    }

    if (!category.trim()) {
      alert('Please enter the boat category.')
      return
    }

    if (!capacity.trim()) {
      alert('Please enter the boat capacity.')
      return
    }

    if (!price.trim()) {
      alert('Please enter the boat price.')
      return
    }

    setSaving(true)

    try {
      let imageUrl =
        preview || null

      /*
       * Upload a new image if one
       * was selected.
       */
      if (image) {
        imageUrl =
          await uploadBoatImage(image)
      }

      const boatData = {
        name: name.trim(),
        category: category.trim(),
        capacity: capacity.trim(),
        base_price: Number(price),
        image_url: imageUrl,
      }

      /*
       * EDIT EXISTING BOAT
       */
      if (editingId !== null) {
        const { error } =
          await supabase
            .from('boats')
            .update(boatData)
            .eq(
              'id',
              editingId
            )

        if (error) {
          throw error
        }

        alert(
          'Boat updated successfully.'
        )
      }

      /*
       * ADD NEW BOAT
       */
      else {
        const { error } =
          await supabase
            .from('boats')
            .insert(
              boatData
            )

        if (error) {
          throw error
        }

        alert(
          'Boat added successfully.'
        )
      }

      resetForm()

      await loadBoats()
    }

    catch (error: any) {
      console.error(
        'Boat save error:',
        error
      )

      alert(
        error?.message ||
          'Something went wrong.'
      )
    }

    finally {
      setSaving(false)
    }
  }

  async function deleteBoat(
    boat: Boat
  ) {
    const confirmed =
      window.confirm(
        `Delete "${boat.name}"?\n\nThis will remove the boat from the Build Your Boat selection.`
      )

    if (!confirmed) return

    setSaving(true)

    try {
      const { error } =
        await supabase
          .from('boats')
          .delete()
          .eq(
            'id',
            boat.id
          )

      if (error) {
        throw error
      }

      alert(
        'Boat deleted successfully.'
      )

      if (
        editingId === boat.id
      ) {
        resetForm()
      }

      await loadBoats()
    }

    catch (error: any) {
      console.error(
        'Delete boat error:',
        error
      )

      alert(
        error?.message ||
          'Could not delete boat.'
      )
    }

    finally {
      setSaving(false)
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
            Build Your Boat
          </h1>

          <p className="text-slate-400 mt-2">
            Manage the boats customers can select in the live boat configurator.
          </p>

        </div>

        <div className="flex gap-3">

          <Link
            href="/customize"
            target="_blank"
            className="bg-blue-600 hover:bg-blue-700 px-5 py-3 rounded-xl font-semibold transition"
          >
            View Boat Builder
          </Link>

          <Link
            href="/admin"
            className="bg-slate-900 border border-slate-800 hover:border-blue-500 px-5 py-3 rounded-xl font-semibold transition"
          >
            ← Dashboard
          </Link>

        </div>

      </div>


      {/* EDIT / ADD FORM */}

      <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8 mb-10">

        <div className="flex items-center justify-between gap-4 mb-6">

          <div>

            <h2 className="text-2xl font-bold">
              {editingId !== null
                ? 'Edit Boat'
                : 'Add New Boat'}
            </h2>

            <p className="text-slate-500 mt-1">
              Changes are saved directly to the live boat configurator.
            </p>

          </div>

          {editingId !== null && (

            <button
              type="button"
              onClick={resetForm}
              className="text-sm text-slate-400 hover:text-white"
            >
              Cancel Edit
            </button>

          )}

        </div>


        <div className="grid lg:grid-cols-2 gap-6">

          {/* LEFT */}

          <div className="space-y-5">

            {/* NAME */}

            <div>

              <label className="block text-sm font-semibold mb-2">
                Boat Name
              </label>

              <input
                type="text"
                value={name}
                onChange={e =>
                  setName(e.target.value)
                }
                placeholder="DM W19 Utility"
                className="w-full bg-black border border-slate-700 rounded-xl p-4 outline-none focus:border-blue-500"
              />

            </div>


            {/* CATEGORY */}

            <div>

              <label className="block text-sm font-semibold mb-2">
                Boat Type
              </label>

              <input
                type="text"
                value={category}
                onChange={e =>
                  setCategory(
                    e.target.value
                  )
                }
                placeholder="Speed Boat"
                className="w-full bg-black border border-slate-700 rounded-xl p-4 outline-none focus:border-blue-500"
              />

            </div>


            {/* CAPACITY */}

            <div>

              <label className="block text-sm font-semibold mb-2">
                Capacity
              </label>

              <input
                type="text"
                value={capacity}
                onChange={e =>
                  setCapacity(
                    e.target.value
                  )
                }
                placeholder="12–16 passengers"
                className="w-full bg-black border border-slate-700 rounded-xl p-4 outline-none focus:border-blue-500"
              />

            </div>


            {/* PRICE */}

            <div>

              <label className="block text-sm font-semibold mb-2">
                Boat Price (₦)
              </label>

              <input
                type="number"
                value={price}
                onChange={e =>
                  setPrice(
                    e.target.value
                  )
                }
                placeholder="1800000"
                className="w-full bg-black border border-slate-700 rounded-xl p-4 outline-none focus:border-blue-500"
              />

              {price && (

                <p className="text-blue-400 mt-2 font-semibold">
                  ₦{Number(
                    price
                  ).toLocaleString()}
                </p>

              )}

            </div>

          </div>


          {/* IMAGE */}

          <div>

            <label className="block text-sm font-semibold mb-2">
              Boat Image
            </label>

            <div className="border border-dashed border-slate-700 rounded-2xl p-5 bg-black">

              {preview ? (

                <div>

                  <img
                    src={preview}
                    alt={
                      name ||
                      'Boat preview'
                    }
                    className="w-full h-64 object-contain rounded-xl bg-slate-950"
                  />

                  <p className="text-slate-500 text-sm mt-3">
                    Select another image below to replace this image.
                  </p>

                </div>

              ) : (

                <div className="h-64 flex items-center justify-center text-center">

                  <div>

                    <div className="text-5xl mb-3">
                      🛥️
                    </div>

                    <p className="text-slate-400">
                      No boat image selected
                    </p>

                  </div>

                </div>

              )}

              <input
                type="file"
                accept="image/*"
                onChange={
                  handleImage
                }
                className="w-full mt-5 text-sm text-slate-400 bg-slate-900 border border-slate-700 rounded-xl p-3"
              />

            </div>

          </div>

        </div>


        {/* SAVE */}

        <div className="flex flex-col md:flex-row gap-3 mt-7">

          <button
            type="button"
            onClick={saveBoat}
            disabled={saving}
            className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed py-4 rounded-xl font-bold transition"
          >
            {saving
              ? 'Saving...'
              : editingId !== null
              ? 'Save Boat Changes'
              : 'Add Boat'}
          </button>

          {editingId !== null && (

            <button
              type="button"
              onClick={resetForm}
              disabled={saving}
              className="md:w-40 bg-slate-800 hover:bg-slate-700 py-4 rounded-xl font-bold transition"
            >
              Cancel
            </button>

          )}

        </div>

      </section>


      {/* BOAT LIST */}

      <section>

        <div className="flex items-center justify-between mb-5">

          <div>

            <h2 className="text-2xl font-bold">
              Your Boats
            </h2>

            <p className="text-slate-500 mt-1">
              These are the boats currently available in Choose Your Boat.
            </p>

          </div>

          <span className="bg-slate-900 border border-slate-800 px-4 py-2 rounded-full text-sm text-slate-400">
            {boats.length} boat
            {boats.length === 1
              ? ''
              : 's'}
          </span>

        </div>


        {loading ? (

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-10 text-center">

            <p className="text-slate-400">
              Loading boats...
            </p>

          </div>

        ) : boats.length === 0 ? (

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-10 text-center">

            <div className="text-5xl mb-4">
              🛥️
            </div>

            <h3 className="text-xl font-bold">
              No boats yet
            </h3>

            <p className="text-slate-500 mt-2">
              Add your first boat above.
            </p>

          </div>

        ) : (

          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">

            {boats.map(boat => (

              <div
                key={boat.id}
                className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden hover:border-blue-500 transition"
              >

                {/* IMAGE */}

                <div className="h-56 bg-black flex items-center justify-center">

                  {boat.image_url ? (

                    <img
                      src={boat.image_url}
                      alt={boat.name}
                      className="w-full h-full object-contain"
                    />

                  ) : (

                    <div className="text-center text-slate-600">

                      <div className="text-5xl">
                        🛥️
                      </div>

                      <p className="mt-2 text-sm">
                        No image
                      </p>

                    </div>

                  )}

                </div>


                {/* DETAILS */}

                <div className="p-5">

                  <h3 className="text-xl font-bold">
                    {boat.name}
                  </h3>

                  <p className="text-blue-400 mt-1">
                    {boat.category}
                  </p>

                  <p className="text-slate-400 text-sm mt-3">
                    Capacity: {boat.capacity}
                  </p>

                  <p className="text-2xl font-bold mt-4">
                    ₦{Number(
                      boat.base_price
                    ).toLocaleString()}
                  </p>


                  {/* ACTIONS */}

                  <div className="grid grid-cols-2 gap-3 mt-5">

                    <button
                      type="button"
                      onClick={() =>
                        editBoat(boat)
                      }
                      disabled={saving}
                      className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 py-3 rounded-xl font-semibold transition"
                    >
                      ✏️ Edit
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        deleteBoat(boat)
                      }
                      disabled={saving}
                      className="bg-red-600 hover:bg-red-700 disabled:opacity-50 py-3 rounded-xl font-semibold transition"
                    >
                      🗑️ Delete
                    </button>

                  </div>

                </div>

              </div>

            ))}

          </div>

        )}

      </section>


      {/* INFORMATION */}

      <section className="mt-10 bg-blue-950/30 border border-blue-900 rounded-2xl p-6">

        <h3 className="font-bold text-lg">
          How this works
        </h3>

        <div className="grid md:grid-cols-3 gap-5 mt-5">

          <div>

            <p className="font-semibold">
              🖼️ Add Images
            </p>

            <p className="text-sm text-slate-500 mt-1">
              Upload the boat image directly from your phone.
            </p>

          </div>

          <div>

            <p className="font-semibold">
              💰 Change Prices
            </p>

            <p className="text-sm text-slate-500 mt-1">
              Change the boat price whenever you want.
            </p>

          </div>

          <div>

            <p className="font-semibold">
              ⚡ Live Updates
            </p>

            <p className="text-sm text-slate-500 mt-1">
              Changes are saved directly to Supabase and appear on the live configurator without a new deployment.
            </p>

          </div>

        </div>

      </section>

    </main>
  )
}
