'use client'

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

    alert('Boat information is ready. We will connect it to Supabase next.')

  }


  return (

    <main className="min-h-screen text-white">

      <div className="flex justify-between items-center mb-10">

        <div>

          <h1 className="text-4xl font-bold">
            Boat Builds
          </h1>

          <p className="text-gray-400 mt-2">
            Manage boats displayed in the Build Your Boat section.
          </p>

        </div>

      </div>


      <div className="max-w-3xl bg-zinc-900 border border-zinc-800 rounded-xl p-8">

        <h2 className="text-2xl font-bold mb-6">
          Add Boat Build
        </h2>


        <div className="space-y-5">


          <div>

            <label className="block mb-2 font-semibold">
              Boat Name
            </label>

            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. DATA MARINE 24FT Fishing Boat"
              className="w-full bg-black border border-zinc-700 rounded-lg p-3"
            />

          </div>


          <div>

            <label className="block mb-2 font-semibold">
              Boat Type
            </label>

            <input
              type="text"
              value={type}
              onChange={e => setType(e.target.value)}
              placeholder="Fishing Boat, Speed Boat, Patrol Boat..."
              className="w-full bg-black border border-zinc-700 rounded-lg p-3"
            />

          </div>


          <div>

            <label className="block mb-2 font-semibold">
              Description
            </label>

            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Describe the boat..."
              rows={5}
              className="w-full bg-black border border-zinc-700 rounded-lg p-3"
            />

          </div>


          <div>

            <label className="block mb-2 font-semibold">
              Boat Picture
            </label>

            <input
              type="file"
              accept="image/*"
              onChange={handleImage}
              className="w-full"
            />

            <p className="text-gray-500 text-sm mt-2">
              Upload a picture of a boat built by DATA MARINE.
            </p>

          </div>


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


          <label className="flex items-center gap-3">

            <input
              type="checkbox"
              checked={featured}
              onChange={e => setFeatured(e.target.checked)}
              className="w-5 h-5"
            />

            <span>
              Featured Boat
            </span>

          </label>


          <button
            onClick={addBoat}
            className="w-full bg-blue-600 hover:bg-blue-700 py-3 rounded-lg font-bold"
          >
            Add Boat Build
          </button>


        </div>

      </div>

    </main>

  )

}