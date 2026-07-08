'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'

type Quote = {
  customer_name: string
  boat_name: string
  engine_name: string
  total_price: number
  payment_status: string
  order_stage: string
  tracking_id: string
  created_at: string
  notes: string
}

const stages = [
  'quote_sent',
  'awaiting_payment',
  'paid',
  'in_production',
  'ready',
  'delivered'
]

const stageNames: Record<string, string> = {
  quote_sent: 'Quote Sent',
  awaiting_payment: 'Awaiting Payment',
  paid: 'Payment Confirmed',
  in_production: 'In Production',
  ready: 'Ready for Collection',
  delivered: 'Delivered'
}

export default function TrackingPage() {
  const { trackingId } = useParams()

  const [quote, setQuote] = useState<Quote | null>(null)
  const [loading, setLoading] = useState(true)
const [history, setHistory] = useState<any[]>([])
  useEffect(() => {
    loadQuote()
  }, [])

 const loadQuote = async () => {
  // Load quote
  const { data: quoteData } = await supabase
    .from('quotes')
    .select('*')
    .eq('tracking_id', trackingId)
    .single()

  if (!quoteData) {
    setLoading(false)
    return
  }

  setQuote(quoteData)

  // Load order history
  const { data: historyData } = await supabase
    .from('order_history')
    .select('*')
    .eq('quote_id', quoteData.id)
    .order('created_at', { ascending: true })

  setHistory(historyData || [])

  setLoading(false)
}

  if (loading)
    return (
      <div className="p-10">
        Loading...
      </div>
    )

  if (!quote)
    return (
      <div className="p-10">
        Tracking ID not found.
      </div>
    )

  const currentStage = stages.indexOf(quote.order_stage)

  return (
    <div className="max-w-5xl mx-auto p-8">

      <h1 className="text-4xl font-bold mb-8">
        Order Tracking
      </h1>
<div className="border rounded-lg mt-8 p-6">

  <h2 className="text-2xl font-bold mb-6">
    Order Timeline
  </h2>

  {history.length === 0 ? (
    <p>No updates yet.</p>
  ) : (
    <div className="space-y-4">

      {history.map((item) => (

        <div
          key={item.id}
          className="border-l-4 border-blue-600 pl-4"
        >
          <p className="font-semibold">
            {item.message}
          </p>

          <p className="text-gray-500 text-sm">
            {new Date(item.created_at).toLocaleString()}
          </p>
        </div>

      ))}

    </div>
  )}

</div>
      <div className="grid md:grid-cols-2 gap-6">

        <div className="border rounded-lg p-6">

          <h2 className="font-bold text-xl mb-4">
            Customer
          </h2>

          <p>
            <b>Name:</b> {quote.customer_name}
          </p>

          <p>
            <b>Tracking ID:</b> {quote.tracking_id}
          </p>

          <p>
            <b>Date:</b>{' '}
            {new Date(
              quote.created_at
            ).toLocaleDateString()}
          </p>

        </div>

        <div className="border rounded-lg p-6">

          <h2 className="font-bold text-xl mb-4">
            Boat Details
          </h2>

          <p>
            <b>Boat:</b> {quote.boat_name}
          </p>

          <p>
            <b>Engine:</b> {quote.engine_name}
          </p>

          <p>
            <b>Total:</b> ₦
            {Number(
              quote.total_price
            ).toLocaleString()}
          </p>

        </div>

      </div>

      <div className="border rounded-lg mt-8 p-6">

        <h2 className="font-bold text-2xl mb-6">
          Order Progress
        </h2>

        <div className="space-y-5">

          {stages.map((stage, index) => (

            <div
              key={stage}
              className="flex items-center gap-4"
            >

              <div
                className={`w-6 h-6 rounded-full ${
                  index <= currentStage
                    ? 'bg-green-600'
                    : 'bg-gray-300'
                }`}
              />

              <div>

                <h3 className="font-semibold">
                  {stageNames[stage]}
                </h3>

                {index === currentStage && (
                  <p className="text-green-600">
                    Current Stage
                  </p>
                )}

              </div>

            </div>

          ))}

        </div>

      </div>

      <div className="grid md:grid-cols-2 gap-6 mt-8">

        <div className="border rounded-lg p-6">

          <h2 className="font-bold text-xl mb-4">
            Payment
          </h2>

          <p>
            Status:
          </p>

          <div
            className={`mt-3 inline-block px-4 py-2 rounded text-white ${
              quote.payment_status === 'paid'
                ? 'bg-green-600'
                : 'bg-red-500'
            }`}
          >
            {quote.payment_status.toUpperCase()}
          </div>

        </div>

        <div className="border rounded-lg p-6">

          <h2 className="font-bold text-xl mb-4">
            Notes
          </h2>

          <p>
            {quote.notes || 'No notes available'}
          </p>

        </div>

      </div>

    </div>
  )
}