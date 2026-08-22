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

export default function CustomizePage() {
  const [boats, setBoats] = useState<Boat[]>([])
  const [engines, setEngines] = useState<Engine[]>([])

  const [selectedBoat, setSelectedBoat] = useState<Boat | null>(null)
  const [selectedEngine, setSelectedEngine] = useState<Engine | null>(null)

  const [addons, setAddons] = useState<string[]>([])
  const [color, setColor] = useState('blue')

  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [notes, setNotes] = useState('')

  const searchParams = useSearchParams()
  const buildId = searchParams.get('build')

  const addonOptions: Addon[] = [
    { name: 'GPS System', price: 1700000 },
    { name: 'LED Lights', price: 150000 },
    { name: 'Fishing Kit', price: 300000 },
    { name: 'Luxury Seats', price: 250000 }
  ]

  const colors = [
    { name: 'Blue', value: 'blue' },
    { name: 'White', value: 'grey' },
    { name: 'Black', value: 'black' },
    { name: 'Red', value: 'red' }
  ]

  useEffect(() => {
    const load = async () => {
      const [boatsRes, enginesRes] = await Promise.all([
        supabase.from('boats').select('*'),
        supabase.from('engines').select('*')
      ])

      setBoats(boatsRes.data || [])
      setEngines(enginesRes.data || [])
    }

    load()
  }, [])

  useEffect(() => {
    const loadBuild = async () => {
      if (!buildId) return

      const { data } = await supabase
        .from('boat_builds')
        .select('*')
        .eq('id', buildId)
        .single()

      if (!data) return

      setAddons(data.addons || [])
    }

    loadBuild()
  }, [buildId])

  const boatPrice = Number(selectedBoat?.base_price || 0)
  const enginePrice = Number(selectedEngine?.price || 0)

  const addonPrice = addons.reduce((total, addon) => {
    const item = addonOptions.find(a => a.name === addon)
    return total + (item?.price || 0)
  }, 0)

  const total = boatPrice + enginePrice + addonPrice

  const handleEngineChange = (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const id = Number(e.target.value)
    const engine = engines.find(en => en.id === id)
    setSelectedEngine(engine || null)
  }

  const sendQuote = async () => {
    if (!selectedBoat) {
      alert('Select boat')
      return
    }

    if (!selectedEngine) {
      alert('Select engine')
      return
    }

    if (!name || !phone) {
      alert('Please enter your name and phone number')
      return
    }

    const trackingId = uuidv4()

    const { error } = await supabase.from('quotes').insert({
      boat_name: selectedBoat.name,
      boat_price: selectedBoat.base_price,
      engine_name: selectedEngine.name,
      engine_price: selectedEngine.price,
      extras: addons,
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
      order_stage: 'quote_sent'
    })

    if (error) {
      console.log(error)
      alert('Error sending quote')
      return
    }

    const trackingLink =
      `${window.location.origin}/track/${trackingId}`

    alert('Quote sent successfully!')

    window.open(
      `https://wa.me/${phone}?text=Your quote is ready. Track it here: ${trackingLink}`,
      '_blank'
    )

    setName('')
    setPhone('')
    setEmail('')
    setNotes('')
    setSelectedBoat(null)
    setSelectedEngine(null)
    setAddons([])
  }

  const saveBuild = async () => {
    if (!selectedBoat || !selectedEngine) {
      alert('Select boat + engine')
      return
    }

    const { error } = await supabase
      .from('boat_builds')
      .insert({
        boat_id: selectedBoat.id,
        engine_id: selectedEngine.id,
        addons,
        total_price: total
      })

    if (error) {
      console.log(error)
      alert('Failed to save build')
      return
    }

    alert('Build saved!')
  }

  return (
    <main className="min-h-screen bg-black text-white">

      {/* TOP NAVIGATION */}

      <div className="border-b border-slate-800 bg-slate-950">

        <div className="max-w-7xl mx-auto px-6 py-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">

          <div>
            <p className="text-sm uppercase tracking-widest text-blue-400">
              DATA MARINE
            </p>

            <h1 className="text-2xl font-bold mt-1">
              Build Your Boat
            </h1>
          </div>

          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 bg-white text-black px-5 py-3 rounded-lg font-semibold hover:bg-gray-200 transition"
          >
            ← Return to Homepage
          </Link>

        </div>

      </div>

      {/* BUILDER */}

      <div className="max-w-7xl mx-auto p-6 md:p-8">

        {/* BOAT PREVIEW */}

        <div
          className="mb-8 p-8 rounded-2xl text-white font-bold text-center shadow-xl"
          style={{
            background:
              color === 'blue'
                ? '#1e3a8a'
                : color === 'grey'
                ? '#e5e7eb'
                : color === 'black'
                ? '#111827'
                : '#b91c1c'
          }}
        >
          <p className="text-sm uppercase tracking-widest opacity-70 mb-2">
            Your Boat
          </p>

          <h2 className="text-3xl md:text-4xl">
            {selectedBoat?.name || 'Select a Boat'}
          </h2>

        </div>

        {/* BOAT */}

        <h2 className="text-xl font-bold mb-3">
          Select Boat
        </h2>

        <div className="grid md:grid-cols-2 gap-4 mb-8">

          {boats.map(boat => (

            <div
              key={boat.id}
              onClick={() => setSelectedBoat(boat)}
              className={`border p-5 rounded-xl cursor-pointer transition ${
                selectedBoat?.id === boat.id
                  ? 'border-blue-500 bg-blue-950/50'
                  : 'border-slate-700 bg-slate-900 hover:border-blue-500'
              }`}
            >

              <h3 className="font-bold text-lg">
                {boat.name}
              </h3>

              <p className="text-slate-400 mt-1">
                {boat.category}
              </p>

              <p className="text-blue-400 font-bold mt-3">
                ₦{Number(
                  boat.base_price
                ).toLocaleString()}
              </p>

            </div>

          ))}

        </div>

        {/* COLOR */}

        <h2 className="font-bold mb-2">
          Boat Color
        </h2>

        <div className="flex flex-wrap gap-2 mb-8">

          {colors.map(c => (

            <button
              key={c.value}
              onClick={() => setColor(c.value)}
              className={`px-4 py-2 border rounded-lg transition ${
                color === c.value
                  ? 'bg-white text-black border-white'
                  : 'border-slate-700 bg-slate-900 hover:border-blue-500'
              }`}
            >
              {c.name}
            </button>

          ))}

        </div>

        {/* ENGINE */}

        <h2 className="font-bold mb-3">
          Engine
        </h2>

        <select
          className="border border-slate-700 bg-slate-900 text-white p-3 w-full mb-8 rounded-lg"
          value={selectedEngine?.id || ''}
          onChange={handleEngineChange}
        >

          <option value="">
            Select Engine
          </option>

          {engines.map(e => (

            <option key={e.id} value={e.id}>
              {e.name} - ₦{Number(
                e.price
              ).toLocaleString()}
            </option>

          ))}

        </select>

        {/* ADDONS */}

        <h2 className="font-bold mb-3">
          Add-ons
        </h2>

        <div className="grid md:grid-cols-2 gap-3 mb-8">

          {addonOptions.map(addon => (

            <label
              key={addon.name}
              className="border border-slate-700 bg-slate-900 p-4 rounded-xl flex justify-between cursor-pointer hover:border-blue-500 transition"
            >

              <div>

                <input
                  type="checkbox"
                  checked={addons.includes(addon.name)}
                  onChange={(e) => {

                    if (e.target.checked) {
                      setAddons([
                        ...addons,
                        addon.name
                      ])
                    } else {
                      setAddons(
                        addons.filter(
                          a => a !== addon.name
                        )
                      )
                    }

                  }}
                />

                <span className="ml-2">
                  {addon.name}
                </span>

              </div>

              <span className="text-blue-400 font-semibold">
                ₦{addon.price.toLocaleString()}
              </span>

            </label>

          ))}

        </div>

        {/* CUSTOMER DETAILS */}

        <h2 className="font-bold mb-3">
          Customer Details
        </h2>

        <div className="space-y-3 mb-8">

          <input
            className="border border-slate-700 bg-slate-900 text-white p-3 w-full rounded-lg"
            placeholder="Name"
            value={name}
            onChange={e => setName(e.target.value)}
          />

          <input
            className="border border-slate-700 bg-slate-900 text-white p-3 w-full rounded-lg"
            placeholder="Phone"
            value={phone}
            onChange={e => setPhone(e.target.value)}
          />

          <input
            className="border border-slate-700 bg-slate-900 text-white p-3 w-full rounded-lg"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
          />

          <textarea
            className="border border-slate-700 bg-slate-900 text-white p-3 w-full rounded-lg"
            placeholder="Notes (optional)"
            value={notes}
            onChange={e => setNotes(e.target.value)}
            rows={4}
          />

        </div>

        {/* TOTAL */}

        <div className="bg-blue-950 p-6 rounded-2xl border border-blue-800 text-white">

          <div className="space-y-2">

            <p>
              Boat:
              <span className="float-right font-semibold">
                ₦{boatPrice.toLocaleString()}
              </span>
            </p>

            <p>
              Engine:
              <span className="float-right font-semibold">
                ₦{enginePrice.toLocaleString()}
              </span>
            </p>

            <p>
              Add-ons:
              <span className="float-right font-semibold">
                ₦{addonPrice.toLocaleString()}
              </span>
            </p>

          </div>

          <hr className="my-4 border-blue-700" />

          <div className="bg-gradient-to-br from-slate-900 to-blue-950 p-6 rounded-xl border border-blue-700 shadow-2xl">

            <p className="text-sm text-blue-300">
              Estimated Total
            </p>

            <p className="text-3xl font-bold mt-1">
              ₦{total.toLocaleString()}
            </p>

          </div>

          {/* SEND QUOTE */}

          <button
            onClick={sendQuote}
            className="mt-5 bg-blue-600 hover:bg-blue-700 text-white w-full py-3 rounded-lg font-bold transition"
          >
            Send Quote
          </button>

          {/* BANK DETAILS */}

          <div className="mt-6 p-5 border border-blue-900 rounded-xl bg-blue-950">

            <h2 className="font-bold mb-3">
              Bank Transfer Details
            </h2>

            <p>
              <strong>Bank:</strong> Ecobank
            </p>

            <p>
              <strong>Account Name:</strong> DATA MARINE NIG LTD
            </p>

            <p>
              <strong>Account Number:</strong> 0472000141
            </p>

          </div>

          {/* SAVE BUILD */}

          <button
            onClick={saveBuild}
            className="mt-3 bg-black hover:bg-slate-900 border border-slate-700 text-white w-full py-3 rounded-lg font-bold transition"
          >
            Save Build
          </button>

        </div>

      </div>

    </main>
  )
}
