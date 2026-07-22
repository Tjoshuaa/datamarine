'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

type Quote = {
  id: string
  boat_name: string
  engine_name: string
  total_price: number
  customer_name: string
  customer_phone: string
  status: string
  payment_status: string
  order_stage: string
  tracking_id: string
}

export default function AdminQuotesPage() {
  const [quotes, setQuotes] = useState<Quote[]>([])
  const [loading, setLoading] = useState(true)
const [notifications, setNotifications] = useState<any[]>([])
useEffect(() => {
  loadQuotes()
}, [])
  useEffect(() => {
    loadQuotes()
  }, [])

  const loadQuotes = async () => {
    setLoading(true)

    const { data } = await supabase
      .from('quotes')
      .select('*')
      .order('created_at', { ascending: false })

    setQuotes(data || [])
    setLoading(false)
  }
const sendWhatsAppUpdate = (phone: string, message: string) => {
  const cleanPhone = phone.replace(/\D/g, '')

  window.open(
    `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`,
    '_blank'
  )
}
  const updateField = async (
  id: string,
  field: string,
  value: string,
  phone?: string
) => {
  // Update the quote
  const { error } = await supabase
    .from('quotes')
    .update({ [field]: value })
    .eq('id', id)

  if (error) {
    alert('Update failed')
    return
  }

  // Update local state
  setQuotes(prev =>
    prev.map(q =>
      q.id === id
        ? { ...q, [field]: value }
        : q
    )
  )

  // Only create history when order stage changes
  if (field === 'order_stage') {

    const stageMessages: Record<string, string> = {
      quote_sent: 'Quote created',
      awaiting_payment: 'Awaiting customer payment',
      paid: 'Payment received',
      in_production: 'Production started',
      ready: 'Boat ready for collection',
      delivered: 'Boat delivered'
    }

    await supabase
      .from('order_history')
      .insert({
        quote_id: id,
        stage: value,
        message: stageMessages[value] || value
      })
  }

  // Optional WhatsApp notification
  if (field === 'order_stage' && phone) {

    let message = ''

    switch (value) {
      case 'awaiting_payment':
        message = 'Your quotation is ready. Kindly proceed with payment.'
        break

      case 'paid':
        message = 'Payment received. Thank you.'
        break

      case 'in_production':
        message = 'Good news! Your boat is now in production.'
        break

      case 'ready':
        message = 'Your boat is ready for collection.'
        break

      case 'delivered':
        message = 'Your order has been delivered. Thank you for choosing DATA MARINE.'
        break
    }

    if (message) {
      const cleanPhone = phone.replace(/\D/g, '')

      window.open(
        `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`,
        '_blank'
      )
    }
  }
}

  const totalRevenue = quotes.reduce(
    (sum, q) => sum + Number(q.total_price || 0),
    0
  )

  return (
    <div className="p-8">

      <h1 className="text-3xl font-bold mb-6">
        🚤 DATA MARINE CRM Dashboard
      </h1>

      {/* STATS */}
      <div className="grid md:grid-cols-4 gap-4 mb-6">

        <div className="bg-gray-100 p-4 rounded">
          <p>Total Revenue</p>
          <h2 className="text-xl font-bold">
            ₦{totalRevenue.toLocaleString()}
          </h2>
        </div>

        <div className="bg-yellow-100 p-4 rounded">
          <p>Pending</p>
          <h2 className="text-xl font-bold">
            {quotes.filter(q => q.payment_status === 'unpaid').length}
          </h2>
        </div>

        <div className="bg-green-100 p-4 rounded">
          <p>Paid</p>
          <h2 className="text-xl font-bold">
            {quotes.filter(q => q.payment_status === 'paid').length}
          </h2>
        </div>

        <div className="bg-blue-100 p-4 rounded">
          <p>In Production</p>
          <h2 className="text-xl font-bold">
            {quotes.filter(q => q.order_stage === 'in_production').length}
          </h2>
        </div>

      </div>

      {/* TABLE */}
      {loading ? (
        <p>Loading...</p>
      ) : (
        <table className="w-full border">

          <thead>
            <tr className="bg-gray-100">
              <th className="p-2 border">Customer</th>
              <th className="p-2 border">Boat</th>
              <th className="p-2 border">Engine</th>
              <th className="p-2 border">Total</th>
              <th className="p-2 border">Payment</th>
              <th className="p-2 border">Stage</th>
              <th className="p-2 border">Actions</th>
            </tr>
          </thead>

          <tbody>
            {quotes.map(q => (
              <tr key={q.id}>

                <td className="border p-2">
                  <div className="font-bold">{q.customer_name}</div>
                  <div className="text-sm">{q.customer_phone}</div>
                </td>

                <td className="border p-2">{q.boat_name}</td>
                <td className="border p-2">{q.engine_name}</td>

                <td className="border p-2">
                  ₦{Number(q.total_price).toLocaleString()}
                </td>

                {/* PAYMENT */}
                <td className="border p-2">
                  <select
                    value={q.payment_status}
                    onChange={(e) =>
  updateField(q.id, 'order_stage', e.target.value, q.customer_phone)
}
                  >
                    <option value="unpaid">Unpaid</option>
                    <option value="paid">Paid</option>
                  </select>
                </td>

                {/* STAGE */}
                <td className="border p-2">
                  <select
                    value={q.order_stage}
                    onChange={(e) =>
                      updateField(q.id, 'order_stage', e.target.value)
                    }
                  >
                    <option value="quote_sent">Quote Sent</option>
                    <option value="awaiting_payment">Awaiting Payment</option>
                    <option value="paid">Paid</option>
                    <option value="in_production">In Production</option>
                    <option value="ready">Ready</option>
                    <option value="delivered">Delivered</option>
                  </select>
                </td>

                {/* ACTIONS */}
                <td className="border p-2 space-x-2">

                  <a
                    href={`https://wa.me/${q.customer_phone}`}
                    target="_blank"
                    className="bg-green-600 text-white px-2 py-1"
                  >
                    WhatsApp
                  </a>

                  <a
                    href={`/track/${q.tracking_id}`}
                    target="_blank"
                    className="bg-black text-white px-2 py-1"
                  >
                    Track
                  </a>

                </td>

              </tr>
            ))}
          </tbody>

        </table>
      )}
    </div>
  )
}