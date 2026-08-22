'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

type BoatBuild = {
  id: number
  image_url: string
  featured: boolean
}

export default function BoatsBuiltPage() {
  const [boats, setBoats] = useState<BoatBuild[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadBoats()
  }, [])

  async function loadBoats() {
    setLoading(true)

    const { data, error } = await supabase
      .from('boat_builds')
      .select('id, image_url, featured')
      .order('featured', { ascending: false })
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error loading boats:', error)
      setBoats([])
    } else {
      setBoats(data || [])
    }

    setLoading(false)
  }

  return (
    <main className="min-h-screen bg-black text-white">

      {/* HERO */}

      <section className="bg-slate-950 border-b border-slate-800">

        <div className="max-w-7xl mx-auto px-6 py-20">

          <Link
            href="/"
            className="inline-flex items-center bg-blue-600 hover:bg-blue-700 px-5 py-3 rounded-xl font-semibold transition mb-8"
          >
            ← Return to Homepage
          </Link>

          <p className="text-blue-400 uppercase tracking-[0.25em] text-sm font-semibold">
            DATA MARINE ⚓
          </p>

          <h1 className="text-5xl md:text-6xl font-bold mt-4">
            Boats We've Built
          </h1>

          <p className="text-gray-400 text-lg md:text-xl max-w-2xl mt-6">
            Explore some of the boats built by DATA MARINE.
            See our craftsmanship and the different types of
            marine projects we can bring to life.
          </p>

        </div>

      </section>


      {/* GALLERY */}

      <section className="max-w-7xl mx-auto px-6 py-16">

        {loading && (
          <div className="text-center py-20 text-gray-500">
            Loading boats...
          </div>
        )}


        {!loading && boats.length === 0 && (
          <div className="text-center py-20">

            <div className="text-6xl mb-6">
              🚤
            </div>

            <h2 className="text-2xl font-bold">
              Our boat gallery is coming soon.
            </h2>

            <p className="text-gray-500 mt-3">
              We're adding pictures of boats built by DATA MARINE.
            </p>

          </div>
        )}


        {!loading && boats.length > 0 && (

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">

            {boats.map((boat) => (

              <div
                key={boat.id}
                className="group bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden hover:border-blue-500 transition"
              >

                <div className="relative aspect-[4/3] bg-black overflow-hidden">

                  <img
                    src={boat.image_url}
                    alt="Boat built by DATA MARINE"
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                  />

                  {boat.featured && (
                    <span className="absolute top-4 left-4 bg-yellow-400 text-black text-xs font-bold px-3 py-2 rounded-full">
                      Featured
                    </span>
                  )}

                </div>

                <div className="p-5">

                  <p className="text-blue-400 text-sm font-semibold">
                    DATA MARINE ⚓
                  </p>

                  <h2 className="text-xl font-bold mt-2">
                    Boat Built by DATA MARINE
                  </h2>

                </div>

              </div>

            ))}

          </div>

        )}

      </section>


      {/* CTA */}

      <section className="bg-blue-600">

        <div className="max-w-5xl mx-auto text-center px-6 py-20">

          <h2 className="text-4xl md:text-5xl font-bold">
            Want Us to Build Yours?
          </h2>

          <p className="text-blue-100 text-lg mt-5 max-w-2xl mx-auto">
            Design your boat to your preferred specifications,
            choose your engine and accessories, and request a quote.
          </p>

          <Link
            href="/customize"
            className="inline-block mt-8 bg-white text-blue-700 hover:bg-slate-100 px-8 py-4 rounded-xl font-bold transition"
          >
            Build Your Boat →
          </Link>

        </div>

      </section>

    </main>
  )
}
