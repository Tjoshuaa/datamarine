'use client'

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

  const handleEngineChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = Number(e.target.value)
    const engine = engines.find(en => en.id === id)
    setSelectedEngine(engine || null)
  }

  const sendQuote = async () => {
    if (!selectedBoat) return alert('Select boat')
    if (!selectedEngine) return alert('Select engine')

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

    const trackingLink = `${window.location.origin}/track/${trackingId}`

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
    if (!selectedBoat || !selectedEngine) return alert('Select boat + engine')

    const { error } = await supabase.from('boat_builds').insert({
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
    <div className="p-8">

      <div
        className="mb-6 p-6 rounded text-white font-bold text-center"
        style={{
          background:
            color === 'blue' ? '#1e3a8a' :
            color === 'grey' ? '#e5e7eb' :
            color === 'black' ? '#111827' :
            '#b91c1c'
        }}
      >
        {selectedBoat?.name || 'Select a Boat'}
      </div>

      <h2 className="text-xl font-bold mb-3">Select Boat</h2>

      <div className="grid md:grid-cols-2 gap-4 mb-6">
        {boats.map(boat => (
          <div
            key={boat.id}
            onClick={() => setSelectedBoat(boat)}
            className={`border p-4 rounded cursor-pointer ${
              selectedBoat?.id === boat.id ? 'border-blue-600 bg-blue-50' : ''
            }`}
          >
            <h3 className="font-bold">{boat.name}</h3>
            <p>₦{Number(boat.base_price).toLocaleString()}</p>
          </div>
        ))}
      </div>

      <h2 className="font-bold mb-2">Boat Color</h2>

      <div className="flex gap-2 mb-6">
        {colors.map(c => (
          <button
            key={c.value}
            onClick={() => setColor(c.value)}
            className={`px-3 py-1 border rounded ${
              color === c.value ? 'bg-black text-white' : ''
            }`}
          >
            {c.name}
          </button>
        ))}
      </div>

      <h2 className="font-bold mb-3">Engine</h2>

      <select
        className="border p-3 w-full mb-6"
        value={selectedEngine?.id || ''}
        onChange={handleEngineChange}
      >
        <option value="">Select Engine</option>
        {engines.map(e => (
          <option key={e.id} value={e.id}>
            {e.name} - ₦{Number(e.price).toLocaleString()}
          </option>
        ))}
      </select>

      <h2 className="font-bold mb-3">Add-ons</h2>

      <div className="grid md:grid-cols-2 gap-3 mb-6">
        {addonOptions.map(addon => (
          <label key={addon.name} className="border p-3 flex justify-between">
            <div>
              <input
                type="checkbox"
                checked={addons.includes(addon.name)}
                onChange={(e) => {
                  if (e.target.checked) {
                    setAddons([...addons, addon.name])
                  } else {
                    setAddons(addons.filter(a => a !== addon.name))
                  }
                }}
              />
              <span className="ml-2">{addon.name}</span>
            </div>
            <span>₦{addon.price.toLocaleString()}</span>
          </label>
        ))}
      </div>

      <h2 className="font-bold mb-2">Customer Details</h2>

      <input className="border p-3 w-full mb-2" placeholder="Name" value={name} onChange={e => setName(e.target.value)} />
      <input className="border p-3 w-full mb-2" placeholder="Phone" value={phone} onChange={e => setPhone(e.target.value)} />
      <input className="border p-3 w-full mb-2" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />

      <textarea
        className="border p-3 w-full mb-4"
        placeholder="Notes (optional)"
        value={notes}
        onChange={e => setNotes(e.target.value)}
      />

      <div className="bg-blue-950 p-6 rounded border border-blue-800 text-white">

        <p className="text-white">Boat: ₦{boatPrice.toLocaleString()}</p>
<p className="text-white">Engine: ₦{enginePrice.toLocaleString()}</p>
<p className="text-white">Add-ons: ₦{addonPrice.toLocaleString()}</p>

        <hr className="my-3 border-blue-700" />

        <div className="bg-gradient-to-br from-slate-900 to-blue-950 p-6 rounded-xl border border-blue-700 shadow-2xl text-white">
          Total: ₦{total.toLocaleString()}
        </div>

        <button
          onClick={sendQuote}
          className="mt-4 bg-blue-600 text-white w-full py-3 rounded"
        >
          Send Quote
        </button>

        <div className="mt-6 p-4 border border-blue-900 rounded bg-blue-950 text-black">
  <h2 className="font-bold mb-2 text-white">
    Bank Transfer Details
  </h2>

  <p className="text-white">
    <strong>Bank:</strong> Ecobank
  </p>

  <p className="text-white">
    <strong>Account Name:</strong> DATA MARINE NIG LTD
  </p>

  <p className="text-white">
    <strong>Account Number:</strong> 0472000141
  </p>
</div>

        <button
          onClick={saveBuild}
          className="mt-3 bg-black text-white w-full py-3 rounded"
        >
          Save Build
        </button>

      </div>
    </div>
  )
}