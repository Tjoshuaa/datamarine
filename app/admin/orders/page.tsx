'use client'

import { useEffect, useMemo, useState } from 'react'
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

type Filter = 'all' | 'pending' | 'processing' | 'shipped' | 'delivered'

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [updatingId, setUpdatingId] = useState<number | null>(null)
  const [message, setMessage] = useState('')
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<Filter>('all')

  useEffect(() => {
    loadOrders()
  }, [])

  async function loadOrders() {
    setLoading(true)
    setMessage('')

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

  async function updateStatus(
    id: number,
    status: string
  ) {
    setUpdatingId(id)
    setMessage('')

    const { error } = await supabase
      .from('orders')
      .update({ status })
      .eq('id', id)

    if (error) {
      console.error('Error updating order:', error)
      setMessage(
        `Failed to update order: ${error.message}`
      )
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

    setMessage(`Order #${id} updated to ${status}.`)
    setUpdatingId(null)
  }

  const counts = useMemo(() => {
    return {
      total: orders.length,

      pending: orders.filter(
        order => order.status?.toLowerCase() === 'pending'
      ).length,

      processing: orders.filter(
        order =>
          order.status?.toLowerCase() === 'processing'
      ).length,

      shipped: orders.filter(
        order => order.status?.toLowerCase() === 'shipped'
      ).length,

      delivered: orders.filter(
        order =>
          order.status?.toLowerCase() === 'delivered'
      ).length,
    }
  }, [orders])

  const filteredOrders = useMemo(() => {
    const term = search.toLowerCase().trim()

    return orders.filter(order => {

      const matchesSearch =
        !term ||
        String(order.id).includes(term) ||
        order.customer_name
          ?.toLowerCase()
          .includes(term) ||
        order.customer_phone
          ?.toLowerCase()
          .includes(term) ||
        order.customer_email
          ?.toLowerCase()
          .includes(term) ||
        order.tracking_id
          ?.toLowerCase()
          .includes(term)

      const matchesFilter =
        filter === 'all' ||
        order.status?.toLowerCase() === filter

      return matchesSearch && matchesFilter
    })
  }, [orders, search, filter])

  function statusStyle(status: string) {
    switch (status?.toLowerCase()) {
      case 'pending':
        return 'bg-orange-950 text-orange-400 border-orange-800'

      case 'processing':
        return 'bg-yellow-950 text-yellow-400 border-yellow-800'

      case 'shipped':
        return 'bg-blue-950 text-blue-400 border-blue-800'

      case 'delivered':
        return 'bg-green-950 text-green-400 border-green-800'

      default:
        return 'bg-slate-800 text-slate-300 border-slate-700'
    }
  }

  function paymentStyle(payment: string) {
    if (payment?.toLowerCase() === 'paid') {
      return 'text-green-400'
    }

    return 'text-orange-400'
  }

  function whatsappLink(phone: string) {
    const cleaned = phone.replace(/\D/g, '')

    let number = cleaned

    if (number.startsWith('0')) {
      number = '234' + number.substring(1)
    }

    return `https://wa.me/${number}`
  }

  return (
    <main className="min-h-screen bg-black text-white p-6 md:p-10">

      {/* HEADER */}

      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5 mb-10">

        <div>

          <p className="text-sm uppercase tracking-widest text-blue-400">
            Data Marine
          </p>

          <h1 className="text-4xl md:text-5xl font-bold mt-2">
            Orders
          </h1>

          <p className="text-slate-400 mt-2">
            Manage customer orders, payments and deliveries.
          </p>

        </div>

        <button
          onClick={loadOrders}
          disabled={loading}
          className="bg-white text-black px-5 py-3 rounded-xl font-semibold hover:bg-slate-200 disabled:opacity-50"
        >
          {loading ? 'Refreshing...' : '↻ Refresh Orders'}
        </button>

      </div>

      {/* STAT CARDS */}

      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4 mb-8">

        <button
          onClick={() => setFilter('all')}
          className={`text-left rounded-2xl p-5 border transition ${
            filter === 'all'
              ? 'border-blue-500 bg-blue-950/30'
              : 'border-slate-800 bg-slate-900 hover:border-slate-600'
          }`}
        >
          <p className="text-slate-400 text-sm">
            Total Orders
          </p>

          <p className="text-3xl font-bold mt-2">
            {counts.total}
          </p>
        </button>

        <button
          onClick={() => setFilter('pending')}
          className={`text-left rounded-2xl p-5 border transition ${
            filter === 'pending'
              ? 'border-orange-500 bg-orange-950/30'
              : 'border-slate-800 bg-slate-900 hover:border-slate-600'
          }`}
        >
          <p className="text-slate-400 text-sm">
            Pending
          </p>

          <p className="text-3xl font-bold mt-2 text-orange-400">
            {counts.pending}
          </p>
        </button>

        <button
          onClick={() => setFilter('processing')}
          className={`text-left rounded-2xl p-5 border transition ${
            filter === 'processing'
              ? 'border-yellow-500 bg-yellow-950/30'
              : 'border-slate-800 bg-slate-900 hover:border-slate-600'
          }`}
        >
          <p className="text-slate-400 text-sm">
            Processing
          </p>

          <p className="text-3xl font-bold mt-2 text-yellow-400">
            {counts.processing}
          </p>
        </button>

        <button
          onClick={() => setFilter('shipped')}
          className={`text-left rounded-2xl p-5 border transition ${
            filter === 'shipped'
              ? 'border-blue-500 bg-blue-950/30'
              : 'border-slate-800 bg-slate-900 hover:border-slate-600'
          }`}
        >
          <p className="text-slate-400 text-sm">
            Shipped
          </p>

          <p className="text-3xl font-bold mt-2 text-blue-400">
            {counts.shipped}
          </p>
        </button>

        <button
          onClick={() => setFilter('delivered')}
          className={`text-left rounded-2xl p-5 border transition ${
            filter === 'delivered'
              ? 'border-green-500 bg-green-950/30'
              : 'border-slate-800 bg-slate-900 hover:border-slate-600'
          }`}
        >
          <p className="text-slate-400 text-sm">
            Delivered
          </p>

          <p className="text-3xl font-bold mt-2 text-green-400">
            {counts.delivered}
          </p>
        </button>

      </div>

      {/* SEARCH + FILTER */}

      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 mb-6">

        <div className="flex flex-col md:flex-row gap-4">

          <input
            type="text"
            placeholder="Search order ID, customer, phone, email or tracking..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 bg-black border border-slate-700 rounded-xl px-5 py-3 text-white placeholder-slate-500 outline-none focus:border-blue-500"
          />

          <select
            value={filter}
            onChange={(e) =>
              setFilter(e.target.value as Filter)
            }
            className="bg-black text-white border border-slate-700 rounded-xl px-5 py-3 outline-none"
          >
            <option value="all">
              All Orders
            </option>

            <option value="pending">
              Pending
            </option>

            <option value="processing">
              Processing
            </option>

            <option value="shipped">
              Shipped
            </option>

            <option value="delivered">
              Delivered
            </option>
          </select>

        </div>

      </div>

      {/* MESSAGE */}

      {message && (
        <div className="mb-6 rounded-xl bg-slate-900 border border-slate-700 p-4 text-slate-200">
          {message}
        </div>
      )}

      {/* LOADING */}

      {loading && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-10 text-center">
          <p className="text-slate-400">
            Loading orders...
          </p>
        </div>
      )}

      {/* EMPTY */}

      {!loading && filteredOrders.length === 0 && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center">

          <div className="text-5xl mb-4">
            🛒
          </div>

          <h2 className="text-xl font-bold">
            No orders found
          </h2>

          <p className="text-slate-500 mt-2">
            Try changing your search or status filter.
          </p>

        </div>
      )}

      {/* ORDERS */}

      {!loading && filteredOrders.length > 0 && (

        <div className="space-y-5">

          {filteredOrders.map(order => (

            <div
              key={order.id}
              className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden hover:border-slate-600 transition"
            >

              {/* ORDER HEADER */}

              <div className="bg-black px-5 md:px-6 py-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3 border-b border-slate-800">

                <div>

                  <p className="text-sm text-slate-500">
                    ORDER
                  </p>

                  <p className="font-bold text-lg">
                    #{order.id}
                  </p>

                </div>

                <div className="flex items-center gap-3">

                  <span
                    className={`px-3 py-1 rounded-full border text-xs font-semibold ${statusStyle(
                      order.status
                    )}`}
                  >
                    {order.status || 'Pending'}
                  </span>

                  <span
                    className={`text-sm font-semibold ${paymentStyle(
                      order.payment_status
                    )}`}
                  >
                    {order.payment_status || 'Unpaid'}
                  </span>

                </div>

              </div>

              {/* ORDER BODY */}

              <div className="p-5 md:p-6">

                <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-6">

                  <div>

                    <p className="text-xs uppercase tracking-wider text-slate-500">
                      Customer
                    </p>

                    <p className="font-semibold mt-2">
                      {order.customer_name || 'Unknown'}
                    </p>

                    <p className="text-sm text-slate-400 mt-1">
                      {order.customer_phone || 'No phone'}
                    </p>

                    <p className="text-sm text-slate-400 mt-1 break-all">
                      {order.customer_email || 'No email'}
                    </p>

                  </div>

                  <div>

                    <p className="text-xs uppercase tracking-wider text-slate-500">
                      Order Total
                    </p>

                    <p className="text-2xl font-bold mt-2 text-blue-400">
                      ₦
                      {Number(
                        order.total_price || 0
                      ).toLocaleString()}
                    </p>

                  </div>

                  <div>

                    <p className="text-xs uppercase tracking-wider text-slate-500">
                      Tracking
                    </p>

                    <p className="font-semibold mt-2">
                      {order.tracking_id || 'Not assigned'}
                    </p>

                    <p className="text-sm text-slate-500 mt-1">
                      {new Date(
                        order.created_at
                      ).toLocaleString()}
                    </p>

                  </div>

                  <div>

                    <p className="text-xs uppercase tracking-wider text-slate-500">
                      Payment
                    </p>

                    <p
                      className={`font-semibold mt-2 ${paymentStyle(
                        order.payment_status
                      )}`}
                    >
                      {order.payment_status || 'Unpaid'}
                    </p>

                  </div>

                </div>

                {/* ACTIONS */}

                <div className="flex flex-wrap gap-3 mt-7 pt-5 border-t border-slate-800">

                  <button
                    onClick={() =>
                      updateStatus(
                        order.id,
                        'processing'
                      )
                    }
                    disabled={
                      updatingId === order.id ||
                      order.status === 'processing'
                    }
                    className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2.5 rounded-lg font-semibold disabled:opacity-40"
                  >
                    {updatingId === order.id
                      ? 'Updating...'
                      : 'Processing'}
                  </button>

                  <button
                    onClick={() =>
                      updateStatus(
                        order.id,
                        'shipped'
                      )
                    }
                    disabled={
                      updatingId === order.id ||
                      order.status === 'shipped'
                    }
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg font-semibold disabled:opacity-40"
                  >
                    {updatingId === order.id
                      ? 'Updating...'
                      : 'Shipped'}
                  </button>

                  <button
                    onClick={() =>
                      updateStatus(
                        order.id,
                        'delivered'
                      )
                    }
                    disabled={
                      updatingId === order.id ||
                      order.status === 'delivered'
                    }
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2.5 rounded-lg font-semibold disabled:opacity-40"
                  >
                    {updatingId === order.id
                      ? 'Updating...'
                      : 'Delivered'}
                  </button>

                  {order.customer_phone && (
                    <a
                      href={whatsappLink(
                        order.customer_phone
                      )}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-slate-800 hover:bg-slate-700 border border-slate-700 px-4 py-2.5 rounded-lg font-semibold"
                    >
                      WhatsApp Customer
                    </a>
                  )}

                  {order.customer_email && (
                    <a
                      href={`mailto:${order.customer_email}`}
                      className="bg-slate-800 hover:bg-slate-700 border border-slate-700 px-4 py-2.5 rounded-lg font-semibold"
                    >
                      Email Customer
                    </a>
                  )}

                </div>

              </div>

            </div>

          ))}

        </div>

      )}

    </main>
  )
}
