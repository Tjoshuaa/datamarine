'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

type Order = {
  id: number
  customer_name: string
  customer_phone: string
  customer_email: string
  total_price: number
  status: string
  payment_status: string
  tracking_id: string
  created_at: string
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])

  useEffect(() => {
    loadOrders()
  }, [])

  async function loadOrders() {
    const { data } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false })

    setOrders(data || [])
  }

  async function updateStatus(id: number, status: string) {
    await supabase
      .from('orders')
      .update({ status })
      .eq('id', id)

    loadOrders()
  }

  return (
    <main className="max-w-7xl mx-auto p-10">

      <h1 className="text-4xl font-bold mb-10">
        Orders Dashboard
      </h1>

      <div className="space-y-6">

        {orders.map(order => (

          <div
            key={order.id}
            className="bg-white p-6 rounded shadow"
          >

            <div className="flex justify-between">

              <div>

                <h2 className="text-xl font-bold">
                  {order.customer_name}
                </h2>

                <p>{order.customer_phone}</p>
                <p>{order.customer_email}</p>

                <p className="mt-2 text-gray-600">
                  Tracking: {order.tracking_id}
                </p>

              </div>

              <div className="text-right">

                <p className="text-2xl font-bold text-blue-600">
                  ₦{Number(order.total_price).toLocaleString()}
                </p>

                <p className="mt-2">
                  Status: <b>{order.status}</b>
                </p>

                <p>
                  Payment: <b>{order.payment_status}</b>
                </p>

              </div>

            </div>

            <div className="flex gap-3 mt-5">

              <button
                onClick={() => updateStatus(order.id, 'processing')}
                className="bg-yellow-500 text-white px-4 py-2 rounded"
              >
                Processing
              </button>

              <button
                onClick={() => updateStatus(order.id, 'shipped')}
                className="bg-blue-500 text-white px-4 py-2 rounded"
              >
                Shipped
              </button>

              <button
                onClick={() => updateStatus(order.id, 'delivered')}
                className="bg-green-600 text-white px-4 py-2 rounded"
              >
                Delivered
              </button>

            </div>

          </div>

        ))}

      </div>

    </main>
  )
}