'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
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

export default function BoatsBuiltFeatured() {
  const [boats, setBoats] = useState<BoatBuilt[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadFeaturedBoats()
  }, [])

  async function loadFeaturedBoats() {
    setLoading(true)

    const { data, error } = await supabase
      .from('boats_built')
      .select(
        'id,image_url,name,type,description,featured,created_at'
      )
      .eq('featured', true)
      .order('created_at', {
        ascending: false,
      })
      .limit(6)

    if (error) {
      console.error(
        'Featured boats error:',
        error
      )

      setBoats([])
    } else {
      setBoats(data || [])
    }

    setLoading(false)
  }

  if (!loading && boats.length === 0) {
    return null
  }

  return (
    <section className="bg-slate-950 py-24 px-6">

      <div className="max-w-7xl mx-auto">

        {/* HEADER */}

        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-12">

          <div>

            <p className="text-blue-400 text-sm uppercase tracking-[0.25em] font-semibold">
              Our Work
            </p>

            <h2 className="text-4xl md:text-5xl font-bold text-white mt-3">
              Boats We've Built
            </h2>

            <p className="text-gray-400 max-w-2xl mt-4 text-lg leading-7">
              Explore some of the boats designed and built by
              DATA MARINE for our customers.
            </p>

          </div>

          <Link
            href="/boats-we-built"
            className="inline-flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold transition whitespace-nowrap"
          >
            View All Boats →
          </Link>

        </div>

        {/* LOADING */}

        {loading && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">

            {[1, 2, 3].map(item => (
              <div
                key={item}
                className="h-[420px] rounded-3xl bg-slate-900 animate-pulse"
              />
            ))}

          </div>
        )}

        {/* BOATS */}

        {!loading && boats.length > 0 && (

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-7">

            {boats.map(boat => (

              <article
                key={boat.id}
                className="group bg-slate-900 border border-slate-800 hover:border-blue-500/60 rounded-3xl overflow-hidden transition duration-300 hover:-translate-y-1"
              >

                {/* IMAGE */}

                <div className="relative aspect-[4/3] bg-black overflow-hidden">

                  {boat.image_url ? (

                    <img
                      src={boat.image_url}
                      alt={
                        boat.name ||
                        'Boat built by DATA MARINE'
                      }
                      className="w-full h-full object-cover transition duration-700 group-hover:scale-105"
                    />

                  ) : (

                    <div className="w-full h-full flex items-center justify-center">

                      <span className="text-6xl">
                        🚤
                      </span>

                    </div>

                  )}

                  {/* OVERLAY */}

                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

                  {/* FEATURED */}

                  <div className="absolute top-4 left-4">

                    <span className="bg-blue-600 text-white text-xs font-bold uppercase tracking-wider px-3 py-2 rounded-full shadow-lg">
                      Featured Build
                    </span>

                  </div>

                </div>

                {/* CONTENT */}

                <div className="p-6">

                  <div className="flex items-start justify-between gap-4">

                    <div>

                      <h3 className="text-2xl font-bold text-white">
                        {boat.name ||
                          'DATA MARINE Build'}
                      </h3>

                      {boat.type && (
                        <p className="text-blue-400 font-semibold mt-1">
                          {boat.type}
                        </p>
                      )}

                    </div>

                    <span className="text-blue-400 text-xl">
                      ⚓
                    </span>

                  </div>

                  {boat.description && (

                    <p className="text-gray-400 mt-4 leading-6 line-clamp-3">
                      {boat.description}
                    </p>

                  )}

                  <div className="mt-6 pt-5 border-t border-slate-800">

                    <Link
                      href="/boats-we-built"
                      className="text-white font-semibold hover:text-blue-400 transition"
                    >
                      Explore Our Builds →
                    </Link>

                  </div>

                </div>

              </article>

            ))}

          </div>

        )}

      </div>

    </section>
  )
}
