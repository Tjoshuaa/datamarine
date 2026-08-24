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

export default function BoatsWeBuiltPage() {
  const [boats, setBoats] = useState<BoatBuilt[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadBoats()
  }, [])

  async function loadBoats() {
    setLoading(true)

    const { data, error } = await supabase
      .from('boats_built')
      .select(
        'id,image_url,name,type,description,featured,created_at'
      )
      .order('created_at', {
        ascending: false,
      })

    if (error) {
      console.error('Failed to load boats:', error)
      setBoats([])
    } else {
      setBoats(data || [])
    }

    setLoading(false)
  }

  const featuredBoats = boats.filter(
    (boat) => boat.featured === true
  )

  const regularBoats = boats.filter(
    (boat) => boat.featured !== true
  )

  return (
    <main className="min-h-screen bg-slate-950 text-white">

      {/* HERO */}

      <section className="relative overflow-hidden">

        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1540946485063-a40da27545f8?auto=format&fit=crop&w=2000&q=85')",
          }}
        />

        <div className="absolute inset-0 bg-black/70" />

        <div className="relative max-w-7xl mx-auto px-6 py-32 md:py-44">

          <div className="max-w-4xl">

            <p className="text-blue-400 uppercase tracking-[0.3em] text-sm font-bold">
              DATA MARINE ⚓
            </p>

            <h1 className="text-5xl md:text-7xl font-bold leading-tight mt-5">
              Boats We've Built ⚓
            </h1>

            <p className="text-xl md:text-2xl text-gray-300 max-w-2xl mt-6 leading-relaxed">
              Explore boats designed, built and delivered by
              DATA MARINE for customers across Nigeria.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 mt-10">

              <Link
                href="/customize"
                className="bg-blue-600 hover:bg-blue-700 px-8 py-4 rounded-xl font-bold text-center transition"
              >
                Build Your Boat
              </Link>

              <Link
                href="/marketplace"
                className="border border-white/30 bg-white/10 hover:bg-white/20 backdrop-blur-sm px-8 py-4 rounded-xl font-bold text-center transition"
              >
                Shop Marketplace
              </Link>

            </div>

          </div>

        </div>

      </section>

      {/* INTRO */}

      <section className="max-w-7xl mx-auto px-6 py-20">

        <div className="max-w-4xl">

          <p className="text-blue-400 uppercase tracking-[0.25em] text-sm font-bold">
            Our Work
          </p>

          <h2 className="text-3xl md:text-5xl font-bold mt-3 leading-tight">
            Built for the water. Built for the mission.
            Explore the DATA MARINE difference.
          </h2>

          <p className="text-gray-400 text-lg mt-6 leading-relaxed">
            Every DATA MARINE boat is designed around the needs of
            its owner, whether for commercial transportation,
            fishing, security, recreation or professional marine
            operations.
          </p>

        </div>

      </section>

      {/* LOADING */}

      {loading && (
        <section className="max-w-7xl mx-auto px-6 pb-20">

          <div className="text-center py-24 bg-slate-900 rounded-3xl border border-slate-800">

            <div className="text-5xl mb-5">
              🚤
            </div>

            <p className="text-gray-400">
              Loading our latest builds...
            </p>

          </div>

        </section>
      )}

      {/* EMPTY */}

      {!loading && boats.length === 0 && (
        <section className="max-w-7xl mx-auto px-6 pb-20">

          <div className="text-center py-24 bg-slate-900 rounded-3xl border border-slate-800">

            <div className="text-6xl mb-6">
              🚤
            </div>

            <h2 className="text-2xl font-bold">
              Our boat portfolio is coming soon
            </h2>

            <p className="text-gray-500 max-w-lg mx-auto mt-3">
              We're preparing our latest completed projects.
              Check back soon to explore the DATA MARINE fleet.
            </p>

          </div>

        </section>
      )}

      {/* FEATURED BUILDS */}

      {!loading && featuredBoats.length > 0 && (
        <section className="max-w-7xl mx-auto px-6 pb-24">

          <div className="mb-8">

            <p className="text-blue-400 uppercase tracking-[0.25em] text-sm font-bold">
              Featured Builds
            </p>

            <h2 className="text-3xl md:text-4xl font-bold mt-2">
              Featured Projects
            </h2>

          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

            {featuredBoats.map((boat) => (
              <article
                key={boat.id}
                className="group bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden hover:border-blue-500/50 transition"
              >

                <div className="relative aspect-[16/10] overflow-hidden bg-black">

                  {boat.image_url ? (
                    <img
                      src={boat.image_url}
                      alt={
                        boat.name ||
                        'Boat built by DATA MARINE'
                      }
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-700"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-600">
                      No image available
                    </div>
                  )}

                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

                  <span className="absolute top-5 left-5 bg-yellow-400 text-black px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider">
                    Featured Build
                  </span>

                </div>

                <div className="p-7">

                  <p className="text-blue-400 text-sm font-semibold uppercase tracking-wider">
                    DATA MARINE ⚓
                  </p>

                  <h3 className="text-2xl font-bold mt-2">
                    {boat.name || 'Custom DATA MARINE Boat'}
                  </h3>

                  {boat.type && (
                    <p className="text-gray-400 mt-2">
                      {boat.type}
                    </p>
                  )}

                  {boat.description && (
                    <p className="text-gray-400 mt-5 leading-relaxed">
                      {boat.description}
                    </p>
                  )}

                </div>

              </article>
            ))}

          </div>

        </section>
      )}

      {/* ALL BUILDS */}

      {!loading && regularBoats.length > 0 && (
        <section className="max-w-7xl mx-auto px-6 pb-24">

          <div className="mb-8">

            <p className="text-blue-400 uppercase tracking-[0.25em] text-sm font-bold">
              Portfolio
            </p>

            <h2 className="text-3xl md:text-4xl font-bold mt-2">
              Our Builds
            </h2>

          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-7">

            {regularBoats.map((boat) => (
              <article
                key={boat.id}
                className="group bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden hover:border-blue-500/50 transition"
              >

                <div className="relative aspect-[4/3] overflow-hidden bg-black">

                  {boat.image_url ? (
                    <img
                      src={boat.image_url}
                      alt={
                        boat.name ||
                        'Boat built by DATA MARINE'
                      }
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-600">
                      No image available
                    </div>
                  )}

                </div>

                <div className="p-6">

                  <p className="text-blue-400 text-xs font-bold uppercase tracking-wider">
                    DATA MARINE ⚓
                  </p>

                  <h3 className="text-xl font-bold mt-2">
                    {boat.name ||
                      'Boat Built by DATA MARINE'}
                  </h3>

                  {boat.type && (
                    <p className="text-gray-400 text-sm mt-1">
                      {boat.type}
                    </p>
                  )}

                  {boat.description && (
                    <p className="text-gray-500 text-sm mt-4 leading-relaxed">
                      {boat.description}
                    </p>
                  )}

                </div>

              </article>
            ))}

          </div>

        </section>
      )}

      {/* CTA */}

      <section className="border-t border-slate-800 bg-slate-900">

        <div className="max-w-7xl mx-auto px-6 py-20">

          <div className="rounded-3xl bg-blue-600 px-8 py-12 md:px-14 md:py-16 text-center">

            <p className="uppercase tracking-[0.25em] text-blue-100 text-sm font-bold">
              Your Boat. Your Mission.
            </p>

            <h2 className="text-3xl md:text-5xl font-bold mt-4">
              Ready to build your own boat?
            </h2>

            <p className="text-blue-100 max-w-2xl mx-auto mt-5 text-lg">
              Tell us what you need and our team can help you
              design a boat around your requirements.
            </p>

            <Link
              href="/customize"
              className="inline-block mt-8 bg-white text-slate-950 hover:bg-gray-100 px-9 py-4 rounded-xl font-bold transition"
            >
              Start Building Your Boat
            </Link>

          </div>

        </div>

      </section>

    </main>
  )
}
