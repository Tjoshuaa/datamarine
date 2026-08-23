'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { v4 as uuidv4 } from 'uuid'

type Boat = {
  id: number
  name: string
  category: string
  capacity: string
  base_price: number
  image_url: string | null
}

type Engine = {
  id: number
  name: string
  horsepower: string
  stroke_type: string
  price: number
  is_new: boolean
}

type Addon = {
  name: string
  price: number
}

const addonOptions: Addon[] = [
  {
    name: 'GPS System',
    price: 1700000
  },
  {
    name: 'Marine Radio',
    price: 650000
  },
  {
    name: 'Display / Fish Finder',
    price: 850000
  },
  {
    name: 'LED Lights',
    price: 150000
  },
  {
    name: 'Fishing Kit',
    price: 300000
  },
  {
    name: 'Luxury Seats',
    price: 250000
  }
]

const colors = [
  {
    name: 'Ocean Blue',
    value: '#1e3a8a'
  },
  {
    name: 'White',
    value: '#f8fafc'
  },
  {
    name: 'Black',
    value: '#111827'
  },
  {
    name: 'Red',
    value: '#b91c1c'
  },
  {
    name: 'Grey',
    value: '#64748b'
  }
]

export default function CustomizeClient() {
  const [boats, setBoats] = useState<Boat[]>([])
  const [engines, setEngines] = useState<Engine[]>([])

  const [selectedBoat, setSelectedBoat] =
    useState<Boat | null>(null)

  const [selectedEngine, setSelectedEngine] =
    useState<Engine | null>(null)

  const [addons, setAddons] =
    useState<string[]>([])

  const [color, setColor] =
    useState('#1e3a8a')

  const [name, setName] =
    useState('')

  const [phone, setPhone] =
    useState('')

  const [email, setEmail] =
    useState('')

  const [notes, setNotes] =
    useState('')

  const [loading, setLoading] =
    useState(true)

  const [sending, setSending] =
    useState(false)

  const [savingBuild, setSavingBuild] =
    useState(false)

  const searchParams =
    useSearchParams()

  const buildId =
    searchParams.get('build')

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    setLoading(true)

    const [
      boatsRes,
      enginesRes
    ] = await Promise.all([
      supabase
        .from('boats')
        .select(
          'id,name,category,capacity,base_price,image_url'
        )
        .order('id', {
          ascending: true
        }),

      supabase
        .from('engines')
        .select('*')
        .order('id', {
          ascending: true
        })
    ])

    if (boatsRes.error) {
      console.error(
        'Boats error:',
        boatsRes.error
      )
    }

    if (enginesRes.error) {
      console.error(
        'Engines error:',
        enginesRes.error
      )
    }

    setBoats(
      boatsRes.data || []
    )

    setEngines(
      enginesRes.data || []
    )

    setLoading(false)
  }

  useEffect(() => {
    async function loadBuild() {
      if (!buildId) return

      const {
        data,
        error
      } = await supabase
        .from('boat_builds')
        .select('*')
        .eq('id', buildId)
        .single()

      if (error) {
        console.error(
          'Build loading error:',
          error
        )

        return
      }

      if (!data) return

      if (data.boat_id) {
        const boat =
          boats.find(
            item =>
              item.id === data.boat_id
          )

        if (boat) {
          setSelectedBoat(boat)
        }
      }

      if (data.engine_id) {
        const engine =
          engines.find(
            item =>
              item.id === data.engine_id
          )

        if (engine) {
          setSelectedEngine(engine)
        }
      }

      setAddons(
        Array.isArray(data.addons)
          ? data.addons
          : []
      )
    }

    if (boats.length > 0 || engines.length > 0) {
      loadBuild()
    }
  }, [
    buildId,
    boats,
    engines
  ])

  const boatPrice =
    Number(
      selectedBoat?.base_price || 0
    )

  const enginePrice =
    Number(
      selectedEngine?.price || 0
    )

  const addonPrice =
    addons.reduce(
      (
        total,
        addonName
      ) => {
        const addon =
          addonOptions.find(
            item =>
              item.name ===
              addonName
          )

        return (
          total +
          Number(
            addon?.price || 0
          )
        )
      },
      0
    )

  const total =
    boatPrice +
    enginePrice +
    addonPrice

  function selectBoat(
    boat: Boat
  ) {
    setSelectedBoat(boat)
  }

  function selectEngine(
    e: React.ChangeEvent<HTMLSelectElement>
  ) {
    const id =
      Number(e.target.value)

    const engine =
      engines.find(
        item =>
          item.id === id
      ) || null

    setSelectedEngine(
      engine
    )
  }

  function toggleAddon(
    addonName: string,
    checked: boolean
  ) {
    if (checked) {
      setAddons(current => {
        if (
          current.includes(
            addonName
          )
        ) {
          return current
        }

        return [
          ...current,
          addonName
        ]
      })
    } else {
      setAddons(current =>
        current.filter(
          item =>
            item !== addonName
        )
      )
    }
  }

  async function sendQuote() {
    if (!selectedBoat) {
      alert(
        'Please select a boat.'
      )
      return
    }

    if (!selectedEngine) {
      alert(
        'Please select an engine.'
      )
      return
    }

    if (!name.trim()) {
      alert(
        'Please enter your name.'
      )
      return
    }

    if (!phone.trim()) {
      alert(
        'Please enter your phone number.'
      )
      return
    }

    setSending(true)

    try {
      const trackingId =
        uuidv4()

      const {
        error
      } = await supabase
        .from('quotes')
        .insert({
          boat_name:
            selectedBoat.name,

          boat_price:
            selectedBoat.base_price,

          engine_name:
            selectedEngine.name,

          engine_price:
            selectedEngine.price,

          extras:
            addons,

          total_price:
            total,

          customer_name:
            name.trim(),

          customer_phone:
            phone.trim(),

          customer_email:
            email.trim(),

          notes:
            `Boat color: ${
              colors.find(
                item =>
                  item.value ===
                  color
              )?.name ||
              color
            }. ${
              notes.trim()
                ? notes.trim()
                : ''
            }`,

          tracking_id:
            trackingId,

          status:
            'pending',

          payment_status:
            'unpaid',

          payment_method:
            'bank_transfer',

          order_status:
            'quote_sent',

          order_stage:
            'quote_sent'
        })

      if (error) {
        throw error
      }

      const trackingLink =
        `${window.location.origin}/track/${trackingId}`

      const message =
        `Hello DATA MARINE,%0A%0A` +
        `I have configured a boat and would like a quote.%0A%0A` +
        `Boat: ${encodeURIComponent(
          selectedBoat.name
        )}%0A` +
        `Color: ${encodeURIComponent(
          colors.find(
            item =>
              item.value ===
              color
          )?.name ||
            color
        )}%0A` +
        `Engine: ${encodeURIComponent(
          selectedEngine.name
        )}%0A` +
        `Estimated Total: ₦${total.toLocaleString()}%0A%0A` +
        `Customer: ${encodeURIComponent(
          name
        )}%0A` +
        `Phone: ${encodeURIComponent(
          phone
        )}%0A` +
        `Tracking: ${encodeURIComponent(
          trackingLink
        )}`

      alert(
        'Your boat quote has been sent successfully!'
      )

      window.open(
        `https://wa.me/${phone.replace(
          /\D/g,
          ''
        )}?text=${message}`,
        '_blank'
      )

      setName('')
      setPhone('')
      setEmail('')
      setNotes('')
      setSelectedBoat(null)
      setSelectedEngine(null)
      setAddons([])
      setColor('#1e3a8a')
    } catch (error: any) {
      console.error(
        'Quote error:',
        error
      )

      alert(
        error?.message ||
          'There was a problem sending your quote. Please try again.'
      )
    } finally {
      setSending(false)
    }
  }

  async function saveBuild() {
    if (!selectedBoat) {
      alert(
        'Please select a boat.'
      )
      return
    }

    if (!selectedEngine) {
      alert(
        'Please select an engine.'
      )
      return
    }

    setSavingBuild(true)

    try {
      const {
        error
      } = await supabase
        .from('boat_builds')
        .insert({
          boat_id:
            selectedBoat.id,

          engine_id:
            selectedEngine.id,

          addons:
            addons,

          total_price:
            total
        })

      if (error) {
        throw error
      }

      alert(
        'Your boat configuration has been saved.'
      )
    } catch (error: any) {
      console.error(
        'Save build error:',
        error
      )

      alert(
        error?.message ||
          'Failed to save your build.'
      )
    } finally {
      setSavingBuild(false)
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-black text-white flex items-center justify-center p-6">

        <div className="text-center">

          <div className="text-5xl mb-5">
            🚤
          </div>

          <h1 className="text-2xl font-bold">
            Loading Boat Builder...
          </h1>

          <p className="text-gray-500 mt-2">
            Preparing your customization options.
          </p>

        </div>

      </main>
    )
  }

  const selectedColorName =
    colors.find(
      item =>
        item.value === color
    )?.name || 'Custom'

  return (
    <main className="min-h-screen bg-black text-white">

      {/* HEADER */}

      <header className="border-b border-slate-800 bg-slate-950">

        <div className="max-w-7xl mx-auto px-6 py-5 flex flex-col md:flex-row md:items-center md:justify-between gap-5">

          <div>

            <p className="text-sm uppercase tracking-[0.25em] text-blue-400 font-semibold">
              DATA MARINE ⚓
            </p>

            <h1 className="text-3xl md:text-4xl font-bold mt-1">
              Build Your Boat
            </h1>

            <p className="text-gray-500 mt-2">
              Configure your boat to your preference.
            </p>

          </div>

          <Link
            href="/"
            className="inline-flex items-center justify-center bg-white text-black px-5 py-3 rounded-xl font-semibold hover:bg-gray-200 transition"
          >
            ← Return Home
          </Link>

        </div>

      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">

        <div className="grid lg:grid-cols-[1.2fr_0.8fr] gap-8">

          {/* LEFT */}

          <div className="space-y-8">

            {/* LIVE PREVIEW */}

            <section className="bg-slate-950 border border-slate-800 rounded-3xl overflow-hidden">

              <div className="p-6 border-b border-slate-800">

                <p className="text-blue-400 text-sm uppercase tracking-widest font-semibold">
                  Live Preview
                </p>

                <h2 className="text-2xl font-bold mt-1">
                  Your Boat
                </h2>

              </div>

              <div
                className="relative min-h-[360px] flex items-center justify-center overflow-hidden transition-all duration-500"
                style={{
                  background:
                    `linear-gradient(135deg, ${color} 0%, #020617 100%)`
                }}
              >

                {/* Soft professional color atmosphere */}

                <div
                  className="absolute inset-0 transition-all duration-500"
                  style={{
                    background:
                      `radial-gradient(circle at 50% 45%, ${color}45 0%, transparent 55%)`
                  }}
                />

                <div className="absolute inset-0 bg-black/20" />

                <div className="relative z-10 w-full text-center px-6">

                  {selectedBoat?.image_url ? (

                    <div className="relative mx-auto w-full max-w-2xl">

                      <div
                        className="absolute inset-8 rounded-full blur-3xl opacity-40 transition-all duration-500"
                        style={{
                          backgroundColor:
                            color
                        }}
                      />

                      <img
                        src={
                          selectedBoat.image_url
                        }
                        alt={
                          selectedBoat.name
                        }
                        className="relative mx-auto w-full h-64 md:h-72 object-contain drop-shadow-2xl transition-transform duration-500"
                      />

                    </div>

                  ) : (

                    <div
                      className="mx-auto mb-6 w-64 h-32 rounded-[50%] transition-all duration-500"
                      style={{
                        backgroundColor:
                          color,

                        boxShadow:
                          `0 25px 60px ${color}80`
                      }}
                    >

                      <div className="relative w-full h-full">

                        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-44 h-12 bg-white/90 rounded-[50%]" />

                        <div className="absolute left-1/2 top-[30%] -translate-x-1/2 w-20 h-8 bg-slate-900 rounded-t-lg" />

                      </div>

                    </div>

                  )}

                  <p className="text-xs uppercase tracking-widest text-white/60">
                    Selected Boat
                  </p>

                  <h2 className="text-3xl font-bold mt-2">
                    {selectedBoat?.name ||
                      'Select a Boat'}
                  </h2>

                  {selectedBoat && (
                    <p className="text-white/70 mt-2">
                      {selectedColorName}
                      {selectedEngine
                        ? ` • ${selectedEngine.name}`
                        : ''}
                    </p>
                  )}

                </div>

              </div>

            </section>

            {/* CHOOSE YOUR BOAT */}

            <section>

              <div className="mb-5">

                <p className="text-blue-400 text-sm uppercase tracking-widest font-semibold">
                  Step 1
                </p>

                <h2 className="text-2xl font-bold">
                  Choose Your Boat
                </h2>

                <p className="text-gray-500 mt-1">
                  Select the boat you want to customize.
                </p>

              </div>

              {boats.length === 0 ? (

                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center">

                  <p className="text-gray-400">
                    No boats are currently available.
                  </p>

                </div>

              ) : (

                <div className="grid md:grid-cols-2 gap-4">

                  {boats.map(
                    boat => {

                      const isSelected =
                        selectedBoat?.id ===
                        boat.id

                      return (

                        <button
                          key={boat.id}
                          type="button"
                          onClick={() =>
                            selectBoat(
                              boat
                            )
                          }
                          className={`text-left overflow-hidden rounded-2xl border transition ${
                            isSelected
                              ? 'border-blue-500 bg-blue-950/40 ring-2 ring-blue-500/30'
                              : 'border-slate-800 bg-slate-900 hover:border-blue-500'
                          }`}
                        >

                          {boat.image_url ? (

                            <div className="w-full h-52 bg-white flex items-center justify-center overflow-hidden">

                              <img
                                src={
                                  boat.image_url
                                }
                                alt={
                                  boat.name
                                }
                                className="w-full h-full object-contain"
                              />

                            </div>

                          ) : (

                            <div className="w-full h-52 bg-slate-950 flex items-center justify-center">

                              <div className="text-center">

                                <div className="text-5xl">
                                  🚤
                                </div>

                                <p className="text-gray-600 text-sm mt-2">
                                  No boat image
                                </p>

                              </div>

                            </div>

                          )}

                          <div className="p-5">

                            <div className="flex items-start justify-between gap-4">

                              <div>

                                <h3 className="text-xl font-bold">
                                  {boat.name}
                                </h3>

                                <p className="text-gray-500 mt-1">
                                  {boat.category}
                                </p>

                              </div>

                              {isSelected && (

                                <span className="bg-blue-600 text-white text-xs px-3 py-1 rounded-full whitespace-nowrap">
                                  Selected
                                </span>

                              )}

                            </div>

                            <p className="text-gray-400 text-sm mt-4">
                              Capacity: {boat.capacity}
                            </p>

                            <p className="text-blue-400 font-bold text-lg mt-4">
                              ₦{Number(
                                boat.base_price
                              ).toLocaleString()}
                            </p>

                          </div>

                        </button>

                      )
                    }
                  )}

                </div>

              )}

            </section>

            {/* COLOR */}

            <section>

              <div className="mb-5">

                <p className="text-blue-400 text-sm uppercase tracking-widest font-semibold">
                  Step 2
                </p>

                <h2 className="text-2xl font-bold">
                  Choose Your Color
                </h2>

                <p className="text-gray-500 mt-1">
                  Preview your preferred finish.
                </p>

              </div>

              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">

                {colors.map(
                  item => (

                    <button
                      key={item.value}
                      type="button"
                      onClick={() =>
                        setColor(
                          item.value
                        )
                      }
                      className={`p-4 rounded-2xl border transition ${
                        color ===
                        item.value
                          ? 'border-blue-500 ring-2 ring-blue-500/30 bg-blue-950/20'
                          : 'border-slate-800 bg-slate-950 hover:border-slate-600'
                      }`}
                    >

                      <div
                        className="w-full h-12 rounded-xl border border-white/10"
                        style={{
                          backgroundColor:
                            item.value
                        }}
                      />

                      <p className="text-sm font-semibold mt-3">
                        {item.name}
                      </p>

                    </button>

                  )
                )}

              </div>

            </section>

            {/* ENGINE */}

            <section>

              <div className="mb-5">

                <p className="text-blue-400 text-sm uppercase tracking-widest font-semibold">
                  Step 3
                </p>

                <h2 className="text-2xl font-bold">
                  Select Your Engine
                </h2>

              </div>

              <select
                className="w-full bg-slate-900 border border-slate-700 text-white rounded-2xl p-4 focus:border-blue-500 outline-none"
                value={
                  selectedEngine?.id ||
                  ''
                }
                onChange={
                  selectEngine
                }
              >

                <option value="">
                  Select an engine
                </option>

                {engines.map(
                  engine => (

                    <option
                      key={engine.id}
                      value={engine.id}
                    >
                      {engine.name}
                      {engine.horsepower
                        ? ` - ${engine.horsepower}`
                        : ''}
                      {' - ₦'}
                      {Number(
                        engine.price
                      ).toLocaleString()}
                    </option>

                  )
                )}

              </select>

            </section>

            {/* ADDONS */}

            <section>

              <div className="mb-5">

                <p className="text-blue-400 text-sm uppercase tracking-widest font-semibold">
                  Step 4
                </p>

                <h2 className="text-2xl font-bold">
                  Equipment & Extras
                </h2>

                <p className="text-gray-500 mt-1">
                  Add the equipment you want on your boat.
                </p>

              </div>

              <div className="grid md:grid-cols-2 gap-3">

                {addonOptions.map(
                  addon => (

                    <label
                      key={addon.name}
                      className={`flex items-center justify-between gap-4 p-4 rounded-2xl border cursor-pointer transition ${
                        addons.includes(
                          addon.name
                        )
                          ? 'border-blue-500 bg-blue-950/30'
                          : 'border-slate-800 bg-slate-900 hover:border-blue-500'
                      }`}
                    >

                      <div className="flex items-center gap-3">

                        <input
                          type="checkbox"
                          checked={addons.includes(
                            addon.name
                          )}
                          onChange={e =>
                            toggleAddon(
                              addon.name,
                              e.target.checked
                            )
                          }
                          className="w-5 h-5 accent-blue-600"
                        />

                        <span className="font-semibold">
                          {addon.name}
                        </span>

                      </div>

                      <span className="text-blue-400 font-semibold whitespace-nowrap">
                        ₦{addon.price.toLocaleString()}
                      </span>

                    </label>

                  )
                )}

              </div>

            </section>

            {/* CUSTOMER */}

            <section>

              <div className="mb-5">

                <p className="text-blue-400 text-sm uppercase tracking-widest font-semibold">
                  Step 5
                </p>

                <h2 className="text-2xl font-bold">
                  Your Details
                </h2>

                <p className="text-gray-500 mt-1">
                  We'll use these details when responding to your quote request.
                </p>

              </div>

              <div className="space-y-4">

                <input
                  type="text"
                  placeholder="Full Name"
                  value={name}
                  onChange={e =>
                    setName(
                      e.target.value
                    )
                  }
                  className="w-full bg-slate-900 border border-slate-700 rounded-2xl p-4 text-white outline-none focus:border-blue-500"
                />

                <input
                  type="tel"
                  placeholder="Phone / WhatsApp Number"
                  value={phone}
                  onChange={e =>
                    setPhone(
                      e.target.value
                    )
                  }
                  className="w-full bg-slate-900 border border-slate-700 rounded-2xl p-4 text-white outline-none focus:border-blue-500"
                />

                <input
                  type="email"
                  placeholder="Email Address"
                  value={email}
                  onChange={e =>
                    setEmail(
                      e.target.value
                    )
                  }
                  className="w-full bg-slate-900 border border-slate-700 rounded-2xl p-4 text-white outline-none focus:border-blue-500"
                />

                <textarea
                  placeholder="Additional requirements or comments"
                  value={notes}
                  onChange={e =>
                    setNotes(
                      e.target.value
                    )
                  }
                  rows={5}
                  className="w-full bg-slate-900 border border-slate-700 rounded-2xl p-4 text-white outline-none focus:border-blue-500 resize-none"
                />

              </div>

            </section>

          </div>

          {/* RIGHT */}

          <aside className="lg:sticky lg:top-6 h-fit">

            <div className="bg-slate-950 border border-slate-800 rounded-3xl overflow-hidden">

              <div className="p-6 border-b border-slate-800">

                <p className="text-blue-400 text-sm uppercase tracking-widest font-semibold">
                  Final Review
                </p>

                <h2 className="text-2xl font-bold mt-1">
                  Your Boat
                </h2>

              </div>

              <div className="p-6 space-y-5">

                {selectedBoat?.image_url && (

                  <div className="relative bg-white rounded-2xl overflow-hidden p-2">

                    <div
                      className="absolute inset-0 opacity-20 transition-colors duration-500"
                      style={{
                        backgroundColor:
                          color
                      }}
                    />

                    <img
                      src={
                        selectedBoat.image_url
                      }
                      alt={
                        selectedBoat.name
                      }
                      className="relative w-full h-40 object-contain"
                    />

                  </div>

                )}

                <div className="flex justify-between gap-5">

                  <span className="text-gray-500">
                    Boat
                  </span>

                  <span className="font-semibold text-right">
                    {selectedBoat?.name ||
                      'Not selected'}
                  </span>

                </div>

                <div className="flex justify-between gap-5">

                  <span className="text-gray-500">
                    Color
                  </span>

                  <div className="flex items-center gap-2">

                    <span
                      className="w-5 h-5 rounded-full border border-white/20"
                      style={{
                        backgroundColor:
                          color
                      }}
                    />

                    <span>
                      {selectedColorName}
                    </span>

                  </div>

                </div>

                <div className="flex justify-between gap-5">

                  <span className="text-gray-500">
                    Engine
                  </span>

                  <span className="font-semibold text-right">
                    {selectedEngine?.name ||
                      'Not selected'}
                  </span>

                </div>

                <div className="border-t border-slate-800 pt-5">

                  <p className="text-gray-500 text-sm mb-3">
                    Equipment
                  </p>

                  {addons.length === 0 ? (

                    <p className="text-gray-600 text-sm">
                      No additional equipment
                    </p>

                  ) : (

                    <div className="space-y-2">

                      {addons.map(
                        addon => (

                          <div
                            key={addon}
                            className="flex justify-between gap-3 text-sm"
                          >

                            <span>
                              {addon}
                            </span>

                            <span className="text-blue-400">
                              ₦{Number(
                                addonOptions.find(
                                  item =>
                                    item.name ===
                                    addon
                                )?.price ||
                                  0
                              ).toLocaleString()}
                            </span>

                          </div>

                        )
                      )}

                    </div>

                  )}

                </div>

                <div className="border-t border-slate-800 pt-5 space-y-3">

                  <div className="flex justify-between">

                    <span className="text-gray-500">
                      Boat
                    </span>

                    <span>
                      ₦{boatPrice.toLocaleString()}
                    </span>

                  </div>

                  <div className="flex justify-between">

                    <span className="text-gray-500">
                      Engine
                    </span>

                    <span>
                      ₦{enginePrice.toLocaleString()}
                    </span>

                  </div>

                  <div className="flex justify-between">

                    <span className="text-gray-500">
                      Equipment
                    </span>

                    <span>
                      ₦{addonPrice.toLocaleString()}
                    </span>

                  </div>

                </div>

                <div className="bg-blue-950 border border-blue-800 rounded-2xl p-5">

                  <p className="text-blue-300 text-sm">
                    Estimated Total
                  </p>

                  <p className="text-3xl font-bold mt-1">
                    ₦{total.toLocaleString()}
                  </p>

                  <p className="text-xs text-blue-300/60 mt-2">
                    Final price will be confirmed by DATA MARINE.
                  </p>

                </div>

                <button
                  type="button"
                  onClick={
                    sendQuote
                  }
                  disabled={
                    sending
                  }
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed py-4 rounded-2xl font-bold transition"
                >
                  {sending
                    ? 'Sending Quote...'
                    : 'Request Quote'}
                </button>

                <button
                  type="button"
                  onClick={
                    saveBuild
                  }
                  disabled={
                    savingBuild
                  }
                  className="w-full bg-slate-900 hover:bg-slate-800 border border-slate-700 disabled:opacity-50 py-4 rounded-2xl font-bold transition"
                >
                  {savingBuild
                    ? 'Saving...'
                    : 'Save My Configuration'}
                </button>

              </div>

            </div>

          </aside>

        </div>

      </div>

    </main>
  )
}
