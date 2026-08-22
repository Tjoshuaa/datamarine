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
  const [loading, setLoading] = useState(true)
  const [updatingId, setUpdatingId] = useState<number | null>(null)
  const [message, setMessage] = useState('')

  useEffect(() => {
    loadOrders()
  }, [])

  async function loadOrders() {
    setLoading(true)

    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error loading orders:', error)
      setMessage(`Error loading orders: ${error.message}`)
      setOrders([])
    } else {
      setOrders(data || [])
    }

    setLoading(false)
  }

  async function updateStatus(id: number, status: string) {
    setUpdatingId(id)
    setMessage('')

    const { error } = await supabase
      .from('orders')
      .update({ status })
      .eq('id', id)

    if (error) {
      console.error('Error updating order:', error)
      setMessage(`Failed to update order: ${error.message}`)
      setUpdatingId(null)
      return
    }

    setOrders(currentOrders =>
      currentOrders.map(order =>
        order.id === id
          ? { ...order, status }
          : order
      )
    )

    setMessage(`Order updated to ${status}.`)
    setUpdatingId(null)
  }

  return (
    <main className="max-w-7xl mx-auto p-10">

      <h1 className="text-4xl font-bold mb-10">
        Orders Dashboard
      </h1>

      {message && (
        <div className="mb-6 rounded-lg bg-zinc-900 border border-zinc-700 p-4">
          {message}
        </div>
      )}

      {loading && (
        <p className="text-gray-500">
          Loading orders...
        </p>
      )}

      {!loading && orders.length === 0 && (
        <div className="bg-white p-6 rounded shadow">
          No orders found.
        </div>
      )}

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
                  Tracking: {order.tracking_id || 'Not assigned'}
                </p>

                <p className="mt-2 text-gray-600">
                  Order ID: #{order.id}
                </p>

                <p className="mt-2 text-gray-600">
                  Date: {new Date(order.created_at).toLocaleString()}
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
                onClick={() =>
                  updateStatus(order.id, 'processing')
                }
                disabled={updatingId === order.id}
                className="bg-yellow-500 text-white px-4 py-2 rounded disabled:opacity-50"
              >
                {updatingId === order.id
                  ? 'Updating...'
                  : 'Processing'}
              </button>

              <button
                onClick={() =>
                  updateStatus(order.id, 'shipped')
                }
                disabled={updatingId === order.id}
                className="bg-blue-500 text-white px-4 py-2 rounded disabled:opacity-50"
              >
                {updatingId === order.id
                  ? 'Updating...'
                  : 'Shipped'}
              </button>

              <button
                onClick={() =>
                  updateStatus(order.id, 'delivered')
                }
                disabled={updatingId === order.id}
                className="bg-green-600 text-white px-4 py-2 rounded disabled:opacity-50"
              >
                {updatingId === order.id
                  ? 'Updating...'
                  : 'Delivered'}
              </button>

            </div>

          </div>

        ))}

      </div>

    </main>
  )
}
