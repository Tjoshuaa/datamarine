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
  image_url?: string | null
  color_images?: Record<string, string> | null
}

type Engine = {
  id: number
  name: string
  horsepower: string
  stroke_type: string
  price: number
  is_new: boolean
  image_url?: string | null
}

type Addon = {
  name: string
  price: number
}

const colors = [
  { name: 'Ocean Blue', value: 'blue', hex: '#2563eb' },
  { name: 'White', value: 'white', hex: '#f8fafc' },
  { name: 'Black', value: 'black', hex: '#111827' },
  { name: 'Red', value: 'red', hex: '#dc2626' },
  { name: 'Yellow', value: 'yellow', hex: '#eab308' },
  { name: 'Green', value: 'green', hex: '#16a34a' },
]

const addonOptions: Addon[] = [
  { name: 'GPS System', price: 1700000 },
  { name: 'LED Lights', price: 150000 },
  { name: 'Fishing Kit', price: 300000 },
  { name: 'Luxury Seats', price: 250000 },
]

export default function CustomizePage() {
  const [boats, setBoats] = useState<Boat[]>([])
  const [engines, setEngines] = useState<Engine[]>([])

  const [selectedBoat, setSelectedBoat] = useState<Boat | null>(null)
  const [selectedEngine, setSelectedEngine] = useState<Engine | null>(null)

  const [color, setColor] = useState('blue')
  const [addons, setAddons] = useState<string[]>([])

  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [notes, setNotes] = useState('')

  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [showReview, setShowReview] = useState(false)

  const searchParams = useSearchParams()
  const buildId = searchParams.get('build')

  useEffect(() => {
    async function loadData() {
      setLoading(true)

      const [boatsRes, enginesRes] = await Promise.all([
        supabase
          .from('boats')
          .select('*')
          .order('id', { ascending: true }),

        supabase
          .from('engines')
          .select('*')
          .order('price', { ascending: true }),
      ])

      if (boatsRes.error) {
        console.error('Boats error:', boatsRes.error)
      }

      if (enginesRes.error) {
        console.error('Engines error:', enginesRes.error)
      }

      setBoats(boatsRes.data || [])
      setEngines(enginesRes.data || [])

      setLoading(false)
    }

    loadData()
  }, [])

  useEffect(() => {
    async function loadBuild() {
      if (!buildId) return

      const { data, error } = await supabase
        .from('boat_builds')
        .select('*')
        .eq('id', buildId)
        .single()

      if (error) {
        console.error(error)
        return
      }

      if (!data) return

      setAddons(data.addons || [])
    }

    loadBuild()
  }, [buildId])

  const boatPrice = Number(selectedBoat?.base_price || 0)
  const enginePrice = Number(selectedEngine?.price || 0)

  const addonPrice = addons.reduce((total, addon) => {
    const item = addonOptions.find(a => a.name === addon)

    return total + Number(item?.price || 0)
  }, 0)

  const total = boatPrice + enginePrice + addonPrice

  /*
   * Get the image for the selected boat.
   *
   * If a colour-specific image exists inside color_images,
   * use that first.
   *
   * Otherwise use image_url.
   */
  const boatImage =
    selectedBoat?.color_images?.[color] ||
    selectedBoat?.image_url ||
    ''

  const selectBoat = (boat: Boat) => {
    setSelectedBoat(boat)

    /*
     * Reset engine when changing boat so the customer
     * deliberately chooses the engine for the new boat.
     */
    setSelectedEngine(null)

    setShowReview(false)
  }

  const selectColor = (value: string) => {
    setColor(value)
    setShowReview(false)
  }

  const selectEngine = (engine: Engine) => {
    setSelectedEngine(engine)
    setShowReview(false)
  }

  const toggleAddon = (addonName: string) => {
    setAddons(current => {
      if (current.includes(addonName)) {
        return current.filter(item => item !== addonName)
      }

      return [...current, addonName]
    })

    setShowReview(false)
  }

  const reviewBoat = () => {
    if (!selectedBoat) {
      alert('Please select a boat first.')
      return
    }

    if (!selectedEngine) {
      alert('Please select an engine.')
      return
    }

    setShowReview(true)

    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    })
  }

  const sendQuote = async () => {
    if (!selectedBoat) {
      alert('Please select a boat.')
      return
    }

    if (!selectedEngine) {
      alert('Please select an engine.')
      return
    }

    if (!name.trim() || !phone.trim()) {
      alert('Please enter your name and WhatsApp/phone number.')
      return
    }

    setSending(true)

    const trackingId = uuidv4()

    const { error } = await supabase
      .from('quotes')
      .insert({
        boat_name: selectedBoat.name,
        boat_price: selectedBoat.base_price,

        engine_name: selectedEngine.name,
        engine_price: selectedEngine.price,

        extras: [
          ...addons,
          `Colour: ${colors.find(c => c.value === color)?.name || color}`,
        ],

        total_price: total,

        customer_name: name,
        customer_phone: phone,
        customer_email: email,

        notes: notes,

        tracking_id: trackingId,

        status: 'pending',
        payment_status: 'unpaid',
        payment_method: 'bank_transfer',

        order_status: 'quote_sent',
        order_stage: 'quote_sent',
      })

    if (error) {
      console.error(error)

      alert(
        'We could not send your quote. Please try again.'
      )

      setSending(false)

      return
    }

    const trackingLink =
      `${window.location.origin}/track/${trackingId}`

    alert(
      'Your boat configuration has been submitted successfully!'
    )

    /*
     * Open WhatsApp for the CUSTOMER.
     *
     * We will later connect your DATA MARINE business
     * WhatsApp notification separately.
     */
    const message =
      `Hello DATA MARINE,%0A%0A` +
      `I would like to request a quote for:%0A%0A` +
      `Boat: ${selectedBoat.name}%0A` +
      `Colour: ${colors.find(c => c.value === color)?.name || color}%0A` +
      `Engine: ${selectedEngine.name}%0A` +
      `Add-ons: ${addons.length ? addons.join(', ') : 'None'}%0A` +
      `Estimated Total: ₦${total.toLocaleString()}%0A%0A` +
      `Track my request:%0A${trackingLink}`

    window.open(
      `https://wa.me/${phone.replace(/\D/g, '')}?text=${message}`,
      '_blank'
    )

    setName('')
    setPhone('')
    setEmail('')
    setNotes('')
    setSelectedBoat(null)
    setSelectedEngine(null)
    setAddons([])
    setColor('blue')
    setShowReview(false)

    setSending(false)
  }

  const formatPrice = (price: number) =>
    `₦${Number(price || 0).toLocaleString()}`

  return (
    <main className="min-h-screen bg-slate-950 text-white">

      {/* HEADER */}

      <header className="border-b border-slate-800 bg-slate-950">

        <div className="max-w-7xl mx-auto px-6 py-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">

          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-blue-400 font-semibold">
              DATA MARINE ⚓
            </p>

            <h1 className="text-3xl font-bold mt-1">
              Build Your Boat
            </h1>

            <p className="text-slate-400 mt-1">
              Design your boat to your exact preference.
            </p>
          </div>

          <Link
            href="/"
            className="inline-flex items-center justify-center bg-white text-black px-5 py-3 rounded-xl font-semibold hover:bg-slate-200 transition"
          >
            ← Homepage
          </Link>

        </div>

      </header>


      {/* PAGE */}

      <div className="max-w-7xl mx-auto px-6 py-10">

        {loading ? (

          <div className="min-h-[500px] flex items-center justify-center">

            <div className="text-center">

              <div className="text-5xl mb-5">
                🚤
              </div>

              <p className="text-slate-400">
                Loading boat configurator...
              </p>

            </div>

          </div>

        ) : (

          <>

            {/* LIVE PREVIEW */}

            <section className="mb-12">

              <div className="flex items-end justify-between mb-5">

                <div>
                  <p className="text-blue-400 text-sm uppercase tracking-widest font-semibold">
                    Live Preview
                  </p>

                  <h2 className="text-2xl md:text-3xl font-bold mt-1">
                    Your Boat
                  </h2>
                </div>

                {selectedBoat && (
                  <span className="hidden sm:block text-slate-500 text-sm">
                    Changes appear instantly
                  </span>
                )}

              </div>


              <div className="relative overflow-hidden rounded-3xl border border-slate-800 bg-slate-900 min-h-[350px] md:min-h-[500px] flex items-center justify-center">

                {/* BACKGROUND */}

                <div
                  className="absolute inset-0 opacity-30"
                  style={{
                    background:
                      color === 'blue'
                        ? 'radial-gradient(circle at center, #2563eb 0%, #020617 65%)'
                        : color === 'white'
                        ? 'radial-gradient(circle at center, #f8fafc 0%, #020617 65%)'
                        : color === 'black'
                        ? 'radial-gradient(circle at center, #475569 0%, #020617 65%)'
                        : color === 'red'
                        ? 'radial-gradient(circle at center, #dc2626 0%, #020617 65%)'
                        : color === 'yellow'
                        ? 'radial-gradient(circle at center, #eab308 0%, #020617 65%)'
                        : 'radial-gradient(circle at center, #16a34a 0%, #020617 65%)',
                  }}
                />


                {/* BOAT IMAGE */}

                {boatImage ? (

                  <div className="relative z-10 w-full h-full flex items-center justify-center p-8">

                    <img
                      src={boatImage}
                      alt={selectedBoat?.name || 'DATA MARINE boat'}
                      className="max-h-[430px] max-w-full object-contain drop-shadow-2xl transition-all duration-500"
                    />

                    {/* ENGINE IMAGE */}

                    {selectedEngine?.image_url && (

                      <img
                        src={selectedEngine.image_url}
                        alt={selectedEngine.name}
                        className="absolute w-24 md:w-36 right-[16%] bottom-[18%] object-contain drop-shadow-2xl pointer-events-none"
                      />

                    )}

                  </div>

                ) : (

                  <div className="relative z-10 text-center px-6">

                    <div className="text-7xl mb-5">
                      🚤
                    </div>

                    <h3 className="text-2xl font-bold">
                      {selectedBoat?.name || 'Choose Your Boat'}
                    </h3>

                    <p className="text-slate-400 mt-2 max-w-md mx-auto">
                      Select a boat below to see its image here.
                    </p>

                  </div>

                )}

              </div>

            </section>


            {/* BOAT SELECTION */}

            <section className="mb-12">

              <div className="mb-5">

                <p className="text-blue-400 text-sm uppercase tracking-widest font-semibold">
                  Step 1
                </p>

                <h2 className="text-2xl font-bold mt-1">
                  Choose Your Boat
                </h2>

              </div>


              {boats.length === 0 ? (

                <div className="border border-red-900 bg-red-950/40 rounded-2xl p-6 text-red-300">
                  No boats are currently available.
                </div>

              ) : (

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">

                  {boats.map(boat => (

                    <button
                      key={boat.id}
                      onClick={() => selectBoat(boat)}
                      className={`text-left overflow-hidden rounded-2xl border transition ${
                        selectedBoat?.id === boat.id
                          ? 'border-blue-500 bg-blue-950/50 ring-2 ring-blue-500/30'
                          : 'border-slate-800 bg-slate-900 hover:border-blue-500'
                      }`}
                    >

                      {boat.image_url ? (

                        <div className="h-48 bg-black">

                          <img
                            src={boat.image_url}
                            alt={boat.name}
                            className="w-full h-full object-cover"
                          />

                        </div>

                      ) : (

                        <div className="h-48 bg-slate-950 flex items-center justify-center text-6xl">
                          🚤
                        </div>

                      )}

                      <div className="p-5">

                        <div className="flex items-start justify-between gap-3">

                          <div>

                            <h3 className="font-bold text-lg">
                              {boat.name}
                            </h3>

                            <p className="text-slate-400 text-sm mt-1">
                              {boat.category}
                            </p>

                          </div>

                          {selectedBoat?.id === boat.id && (
                            <span className="bg-blue-600 rounded-full w-7 h-7 flex items-center justify-center">
                              ✓
                            </span>
                          )}

                        </div>

                        <div className="flex items-center justify-between mt-5">

                          <span className="text-slate-500 text-sm">
                            {boat.capacity}
                          </span>

                          <span className="text-blue-400 font-bold">
                            {formatPrice(boat.base_price)}
                          </span>

                        </div>

                      </div>

                    </button>

                  ))}

                </div>

              )}

            </section>


            {/* CUSTOMIZATION */}

            <section className="grid lg:grid-cols-2 gap-10 mb-12">

              {/* COLOUR */}

              <div>

                <p className="text-blue-400 text-sm uppercase tracking-widest font-semibold">
                  Step 2
                </p>

                <h2 className="text-2xl font-bold mt-1 mb-5">
                  Choose Your Colour
                </h2>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">

                  {colors.map(c => (

                    <button
                      key={c.value}
                      onClick={() => selectColor(c.value)}
                      className={`p-4 rounded-xl border transition ${
                        color === c.value
                          ? 'border-blue-500 bg-blue-950/50'
                          : 'border-slate-800 bg-slate-900 hover:border-blue-500'
                      }`}
                    >

                      <span
                        className="block w-10 h-10 rounded-full mx-auto mb-3 border-2 border-white/30"
                        style={{ backgroundColor: c.hex }}
                      />

                      <span className="text-sm font-semibold">
                        {c.name}
                      </span>

                    </button>

                  ))}

                </div>

              </div>


              {/* ENGINE */}

              <div>

                <p className="text-blue-400 text-sm uppercase tracking-widest font-semibold">
                  Step 3
                </p>

                <h2 className="text-2xl font-bold mt-1 mb-5">
                  Choose Your Engine
                </h2>

                <div className="space-y-3 max-h-[350px] overflow-y-auto pr-2">

                  {engines.map(engine => (

                    <button
                      key={engine.id}
                      onClick={() => selectEngine(engine)}
                      className={`w-full text-left p-4 rounded-xl border transition ${
                        selectedEngine?.id === engine.id
                          ? 'border-blue-500 bg-blue-950/50'
                          : 'border-slate-800 bg-slate-900 hover:border-blue-500'
                      }`}
                    >

                      <div className="flex items-center justify-between gap-4">

                        <div className="flex items-center gap-4">

                          {engine.image_url ? (

                            <img
                              src={engine.image_url}
                              alt={engine.name}
                              className="w-16 h-16 object-contain bg-black rounded-lg"
                            />

                          ) : (

                            <div className="w-16 h-16 bg-black rounded-lg flex items-center justify-center text-2xl">
                              ⚙️
                            </div>

                          )}

                          <div>

                            <p className="font-bold">
                              {engine.name}
                            </p>

                            <p className="text-slate-400 text-sm">
                              {engine.horsepower}
                              {engine.stroke_type
                                ? ` • ${engine.stroke_type}`
                                : ''}
                            </p>

                          </div>

                        </div>

                        <div className="text-right">

                          <p className="text-blue-400 font-bold">
                            {formatPrice(engine.price)}
                          </p>

                          {selectedEngine?.id === engine.id && (
                            <span className="text-green-400 text-xs">
                              Selected ✓
                            </span>
                          )}

                        </div>

                      </div>

                    </button>

                  ))}

                </div>

              </div>

            </section>


            {/* ADDONS */}

            <section className="mb-12">

              <p className="text-blue-400 text-sm uppercase tracking-widest font-semibold">
                Step 4
              </p>

              <h2 className="text-2xl font-bold mt-1 mb-5">
                Seating & Equipment
              </h2>

              <div className="grid md:grid-cols-2 gap-4">

                {addonOptions.map(addon => {

                  const selected =
                    addons.includes(addon.name)

                  return (

                    <button
                      key={addon.name}
                      onClick={() => toggleAddon(addon.name)}
                      className={`text-left p-5 rounded-2xl border transition ${
                        selected
                          ? 'border-blue-500 bg-blue-950/50'
                          : 'border-slate-800 bg-slate-900 hover:border-blue-500'
                      }`}
                    >

                      <div className="flex items-center justify-between">

                        <div>

                          <p className="font-bold">
                            {addon.name}
                          </p>

                          <p className="text-slate-500 text-sm mt-1">
                            Add to your configuration
                          </p>

                        </div>

                        <div className="text-right">

                          <p className="text-blue-400 font-bold">
                            {formatPrice(addon.price)}
                          </p>

                          <span className="text-xs text-slate-500">
                            {selected ? 'Selected ✓' : 'Select'}
                          </span>

                        </div>

                      </div>

                    </button>

                  )

                })}

              </div>

            </section>


            {/* REVIEW */}

            <section className="rounded-3xl border border-slate-800 bg-slate-900 overflow-hidden">

              <div className="p-6 md:p-8">

                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">

                  <div>

                    <p className="text-blue-400 text-sm uppercase tracking-widest font-semibold">
                      Step 5
                    </p>

                    <h2 className="text-2xl md:text-3xl font-bold mt-1">
                      Review Your Boat
                    </h2>

                    <p className="text-slate-400 mt-2">
                      Review your configuration before requesting a quotation.
                    </p>

                  </div>

                  <div className="text-left md:text-right">

                    <p className="text-sm text-slate-500">
                      Estimated Configuration
                    </p>

                    <p className="text-3xl font-bold text-blue-400">
                      {formatPrice(total)}
                    </p>

                  </div>

                </div>


                {showReview && selectedBoat && selectedEngine && (

                  <div className="mt-8 grid md:grid-cols-2 gap-8">

                    <div className="bg-black rounded-2xl overflow-hidden border border-slate-800">

                      {boatImage ? (

                        <img
                          src={boatImage}
                          alt={selectedBoat.name}
                          className="w-full h-72 object-contain"
                        />

                      ) : (

                        <div className="h-72 flex items-center justify-center text-7xl">
                          🚤
                        </div>

                      )}

                    </div>


                    <div className="space-y-4">

                      <div className="flex justify-between border-b border-slate-800 pb-3">

                        <span className="text-slate-400">
                          Boat
                        </span>

                        <span className="font-semibold">
                          {selectedBoat.name}
                        </span>

                      </div>

                      <div className="flex justify-between border-b border-slate-800 pb-3">

                        <span className="text-slate-400">
                          Colour
                        </span>

                        <span className="font-semibold">
                          {colors.find(c => c.value === color)?.name}
                        </span>

                      </div>

                      <div className="flex justify-between border-b border-slate-800 pb-3">

                        <span className="text-slate-400">
                          Engine
                        </span>

                        <span className="font-semibold">
                          {selectedEngine.name}
                        </span>

                      </div>

                      <div className="flex justify-between border-b border-slate-800 pb-3">

                        <span className="text-slate-400">
                          Equipment
                        </span>

                        <span className="font-semibold text-right max-w-[60%]">
                          {addons.length
                            ? addons.join(', ')
                            : 'None'}
                        </span>

                      </div>

                      <div className="pt-3">

                        <p className="text-sm text-slate-500">
                          Estimated Price
                        </p>

                        <p className="text-4xl font-bold text-blue-400 mt-1">
                          {formatPrice(total)}
                        </p>

                      </div>

                    </div>

                  </div>

                )}


                {!showReview && (

                  <button
                    onClick={reviewBoat}
                    className="w-full mt-8 bg-blue-600 hover:bg-blue-700 py-4 rounded-xl font-bold text-lg transition"
                  >
                    Review My Boat →
                  </button>

                )}

              </div>


              {/* QUOTE FORM */}

              {showReview && (

                <div className="border-t border-slate-800 bg-slate-950 p-6 md:p-8">

                  <h3 className="text-xl font-bold">
                    Request Your Quote
                  </h3>

                  <p className="text-slate-400 mt-1 mb-6">
                    Tell DATA MARINE how we can contact you.
                  </p>

                  <div className="grid md:grid-cols-2 gap-4">

                    <input
                      value={name}
                      onChange={e => setName(e.target.value)}
                      placeholder="Full Name *"
                      className="bg-slate-900 border border-slate-700 rounded-xl p-4 outline-none focus:border-blue-500"
                    />

                    <input
                      value={phone}
                      onChange={e => setPhone(e.target.value)}
                      placeholder="WhatsApp / Phone Number *"
                      className="bg-slate-900 border border-slate-700 rounded-xl p-4 outline-none focus:border-blue-500"
                    />

                    <input
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="Email Address"
                      type="email"
                      className="bg-slate-900 border border-slate-700 rounded-xl p-4 outline-none focus:border-blue-500"
                    />

                    <textarea
                      value={notes}
                      onChange={e => setNotes(e.target.value)}
                      placeholder="Additional requirements"
                      rows={1}
                      className="bg-slate-900 border border-slate-700 rounded-xl p-4 outline-none focus:border-blue-500 resize-none"
                    />

                  </div>

                  <button
                    onClick={sendQuote}
                    disabled={sending}
                    className="w-full mt-5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 py-4 rounded-xl font-bold text-lg transition"
                  >
                    {sending
                      ? 'Sending Quote...'
                      : 'Request Quote 🚤'}
                  </button>

                </div>

              )}

            </section>

          </>

        )}

      </div>

    </main>
  )
}
