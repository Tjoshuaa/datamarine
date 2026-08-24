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

export default function BoatsWeveBuilt() {
  const [boats, setBoats] = useState<BoatBuilt[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadBoats() {
      try {
        const { data, error } = await supabase
          .from('boats_built')
          .select(
            'id,image_url,name,type,description,featured,created_at'
          )
          .order('featured', {
            ascending: false,
          })
          .order('created_at', {
            ascending: false,
          })
          .limit(6)

        if (error) {
          console.error(
            'Boats built loading error:',
            error
          )
          return
        }

        setBoats(data || [])
      } catch (error) {
        console.error(
          'Boats built error:',
          error
        )
      } finally {
        setLoading(false)
      }
    }

    loadBoats()
  }, [])

  return (
    <section className="bg-black py-24 px-6">

      <div className="max-w-7xl mx-auto">

        {/* HEADER */}

        <div className="text-center max-w-3xl mx-auto">

          <p className="text-blue-500 uppercase tracking-[0.3em] text-sm font-semibold">
            Our Portfolio
          </p>

          <h2 className="text-4xl md:text-5xl font-bold text-white mt-3">
            Boats We've Built
          </h2>

          <p className="text-gray-400 mt-5 text-lg leading-8">
            Explore some of the custom boats designed and built
            by DATA MARINE for our customers.
          </p>

        </div>

        {/* LOADING */}

        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-7 mt-14">

            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden animate-pulse"
              >
                <div className="aspect-[4/3] bg-slate-800" />

                <div className="p-6">

                  <div className="h-6 bg-slate-800 rounded w-2/3" />

                  <div className="h-4 bg-slate-800 rounded w-1/3 mt-3" />

                  <div className="h-4 bg-slate-800 rounded w-full mt-5" />

                  <div className="h-4 bg-slate-800 rounded w-5/6 mt-2" />

                </div>
              </div>
            ))}

          </div>
        )}

        {/* BOATS */}

        {!loading && boats.length > 0 && (

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-7 mt-14">

            {boats.map((boat) => (

              <article
                key={boat.id}
                className="group bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden hover:border-blue-500/60 hover:-translate-y-1 transition-all duration-300"
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
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />

                  ) : (

                    <div className="w-full h-full flex items-center justify-center text-gray-600">
                      <span className="text-5xl">
                        🚤
                      </span>
                    </div>

                  )}

                  {/* FEATURED BADGE */}

                  {boat.featured && (

                    <div className="absolute top-4 left-4">

                      <span className="inline-flex items-center gap-1 bg-blue-600 text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-lg">
                        ★ Featured
                      </span>

                    </div>

                  )}

                </div>

                {/* CONTENT */}

                <div className="p-6">

                  <div className="flex items-start justify-between gap-4">

                    <div>

                      <h3 className="text-xl font-bold text-white">
                        {boat.name ||
                          'DATA MARINE Boat'}
                      </h3>

                      {boat.type && (

                        <p className="text-blue-400 text-sm font-semibold mt-1">
                          {boat.type}
                        </p>

                      )}

                    </div>

                    <span className="text-slate-700 text-xs">
                      #{boat.id}
                    </span>

                  </div>

                  {boat.description ? (

                    <p className="text-gray-400 text-sm leading-6 mt-4 line-clamp-3">
                      {boat.description}
                    </p>

                  ) : (

                    <p className="text-gray-600 text-sm italic mt-4">
                      Custom boat built by DATA MARINE.
                    </p>

                  )}

                </div>

              </article>

            ))}

          </div>

        )}

        {/* EMPTY STATE */}

        {!loading && boats.length === 0 && (

          <div className="mt-14 bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center">

            <div className="text-6xl mb-5">
              🚤
            </div>

            <h3 className="text-2xl font-bold text-white">
              Our Boat Portfolio
            </h3>

            <p className="text-gray-500 mt-3">
              Completed boat projects will appear here.
            </p>

          </div>

        )}

        {/* CTA */}

        {!loading && boats.length > 0 && (

          <div className="text-center mt-12">

            <Link
              href="/boats-built"
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-7 py-3.5 rounded-xl font-bold transition"
            >
              View All Boats
              <span>→</span>
            </Link>

          </div>

        )}

      </div>

    </section>
  )
}
