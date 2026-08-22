'use client'

import Link from 'next/link'
import { useState } from 'react'

export default function BoatBuildsPage() {
  const [name, setName] = useState('')
  const [type, setType] = useState('')
  const [description, setDescription] = useState('')
  const [image, setImage] = useState<File | null>(null)
  const [preview, setPreview] = useState('')
  const [featured, setFeatured] = useState(false)

  function handleImage(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]

    if (!file) return

    setImage(file)
    setPreview(URL.createObjectURL(file))
  }

  function addBoat() {
    if (!name || !image) {
      alert('Please enter the boat name and upload a picture.')
      return
    }

    alert(
      'Boat information is ready. We will connect it to Supabase next.'
    )
  }

  return (
    <main className="min-h-screen bg-black text-white p-6 md:p-10">

      {/* HEADER */}

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5 mb-10">

        <div>
          <p className="text-sm uppercase tracking-widest text-blue-400">
            Data Marine
          </p>

          <h1 className="text-4xl font-bold mt-2">
            Boat Builds
          </h1>

          <p className="text-gray-400 mt-2">
            Manage boats displayed in the Build Your Boat section.
          </p>
        </div>

        {/* RETURN TO HOMEPAGE */}

        <Link
          href="/"
          className="inline-flex items-center justify-center gap-2 bg-white text-black px-5 py-3 rounded-lg font-semibold hover:bg-gray-200 transition"
        >
          ← Return to Homepage
        </Link>

      </div>

      {/* FORM */}

      <div className="max-w-3xl bg-zinc-900 border border-zinc-800 rounded-2xl p-6 md:p-8">

        <div className="mb-7">

          <h2 className="text-2xl font-bold">
            Add Boat Build
          </h2>

          <p className="text-gray-500 mt-2">
            Add a boat that customers can view in the Build Your Boat section.
          </p>

        </div>

        <div className="space-y-6">

          {/* BOAT NAME */}

          <div>

            <label className="block mb-2 font-semibold">
              Boat Name
            </label>

            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. DATA MARINE 24FT Fishing Boat"
              className="w-full bg-black text-white border border-zinc-700 rounded-lg p-3 outline-none focus:border-blue-500"
            />

          </div>

          {/* BOAT TYPE */}

          <div>

            <label className="block mb-2 font-semibold">
              Boat Type
            </label>

            <input
              type="text"
              value={type}
              onChange={e => setType(e.target.value)}
              placeholder="Fishing Boat, Speed Boat, Patrol Boat..."
              className="w-full bg-black text-white border border-zinc-700 rounded-lg p-3 outline-none focus:border-blue-500"
            />

          </div>

          {/* DESCRIPTION */}

          <div>

            <label className="block mb-2 font-semibold">
              Description
            </label>

            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Describe the boat..."
              rows={5}
              className="w-full bg-black text-white border border-zinc-700 rounded-lg p-3 outline-none focus:border-blue-500 resize-none"
            />

          </div>

          {/* IMAGE */}

          <div>

            <label className="block mb-2 font-semibold">
              Boat Picture
            </label>

            <input
              type="file"
              accept="image/*"
              onChange={handleImage}
              className="w-full text-gray-300 bg-black border border-zinc-700 rounded-lg p-3"
            />

            <p className="text-gray-500 text-sm mt-2">
              Upload a picture of a boat built by DATA MARINE.
            </p>

          </div>

          {/* IMAGE PREVIEW */}

          {preview && (

            <div>

              <p className="mb-2 font-semibold">
                Preview
              </p>

              <img
                src={preview}
                alt="Boat preview"
                className="w-full max-w-lg h-64 object-cover rounded-xl border border-zinc-700"
              />

            </div>

          )}

          {/* FEATURED */}

          <label className="flex items-center gap-3 cursor-pointer">

            <input
              type="checkbox"
              checked={featured}
              onChange={e => setFeatured(e.target.checked)}
              className="w-5 h-5 accent-blue-600"
            />

            <span className="font-medium">
              Featured Boat
            </span>

          </label>

          {/* ADD BOAT */}

          <button
            onClick={addBoat}
            className="w-full bg-blue-600 hover:bg-blue-700 py-3 rounded-lg font-bold transition"
          >
            Add Boat Build
          </button>

        </div>

      </div>

    </main>
  )
}
