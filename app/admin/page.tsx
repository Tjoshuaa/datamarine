'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

type Stats = {
  products: number
  orders: number
  customers: number
  boatBuilds: number
}

type Order = {
  id: number
  customer_name: string | null
  total_price: number | null
  status: string | null
  created_at: string
}

export default function Dashboard() {
  const [stats, setStats] = useState<Stats>({
    products: 0,
    orders: 0,
    customers: 0,
    boatBuilds: 0,
  })

  const [recentOrders, setRecentOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  async function loadDashboard() {
    setLoading(true)

    const [
      productsResult,
      ordersResult,
      customersResult,
      boatBuildsResult,
    ] = await Promise.all([
      supabase
        .from('products')
        .select('*', { count: 'exact', head: true }),

      supabase
        .from('orders')
        .select('*', { count: 'exact', head: true }),

      supabase
        .from('customers')
        .select('*', { count: 'exact', head: true }),

      supabase
        .from('boat_builds')
        .select('*', { count: 'exact', head: true }),
    ])

    setStats({
      products: productsResult.count || 0,
      orders: ordersResult.count || 0,
      customers: customersResult.count || 0,
      boatBuilds: boatBuildsResult.count || 0,
    })

    const { data: orders } = await supabase
      .from('orders')
      .select(
        'id, customer_name, total_price, status, created_at'
      )
      .order('created_at', { ascending: false })
      .limit(5)

    setRecentOrders(orders || [])
    setLoading(false)
  }

  useEffect(() => {
    loadDashboard()
  }, [])

  const cards = [
    {
      title: 'Products',
      value: stats.products,
      href: '/admin/products',
      icon: '📦',
      description: 'Manage inventory',
    },
    {
      title: 'Orders',
      value: stats.orders,
      href: '/admin/orders',
      icon: '🛒',
      description: 'Manage customer orders',
    },
    {
      title: 'Customers',
      value: stats.customers,
      href: '/admin/customers',
      icon: '👥',
      description: 'View your customers',
    },
    {
      title: 'Boat Builds',
      value: stats.boatBuilds,
      href: '/admin/boat-builds',
      icon: '🚤',
      description: 'Manage boat projects',
    },
  ]

  function statusStyle(status: string | null) {
    switch (status?.toLowerCase()) {
      case 'delivered':
        return 'bg-green-950 text-green-400 border-green-800'

      case 'shipped':
        return 'bg-blue-950 text-blue-400 border-blue-800'

      case 'processing':
        return 'bg-yellow-950 text-yellow-400 border-yellow-800'

      default:
        return 'bg-slate-800 text-slate-300 border-slate-700'
    }
  }

  return (
    <main className="min-h-screen bg-black text-white p-6 md:p-10">

      {/* HEADER */}

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5 mb-10">

        <div>

          <p className="text-sm uppercase tracking-widest text-blue-400">
            Data Marine
          </p>

          <h1 className="text-4xl md:text-5xl font-bold mt-2">
            Administration
          </h1>

          <p className="text-slate-400 mt-2">
            Control center for your marine business.
          </p>

        </div>

        <button
          onClick={loadDashboard}
          disabled={loading}
          className="bg-white text-black px-5 py-3 rounded-xl font-semibold hover:bg-slate-200 disabled:opacity-50"
        >
          {loading ? 'Refreshing...' : '↻ Refresh Dashboard'}
        </button>

      </div>

      {/* STATISTICS */}

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-10">

        {cards.map((card) => (

          <Link
            key={card.href}
            href={card.href}
            className="group bg-slate-900 border border-slate-800 rounded-2xl p-6 hover:border-blue-500 hover:-translate-y-1 transition"
          >

            <div className="flex items-start justify-between">

              <div className="text-3xl">
                {card.icon}
              </div>

              <span className="text-slate-500 group-hover:text-blue-400 transition">
                →
              </span>

            </div>

            <p className="text-slate-400 mt-6">
              {card.title}
            </p>

            <p className="text-4xl font-bold mt-1">
              {loading ? '—' : card.value}
            </p>

            <p className="text-sm text-slate-500 mt-2">
              {card.description}
            </p>

          </Link>

        ))}

      </div>

      {/* QUICK ACTIONS */}

      <section className="mb-10">

        <h2 className="text-2xl font-bold mb-5">
          Quick Actions
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">

          <Link
            href="/admin/products"
            className="bg-white text-black rounded-xl p-5 font-semibold hover:bg-slate-200 transition"
          >
            + Add Product
          </Link>

          <Link
            href="/admin/orders"
            className="bg-slate-900 border border-slate-800 rounded-xl p-5 font-semibold hover:border-blue-500 transition"
          >
            View Orders
          </Link>

          <Link
            href="/admin/customers"
            className="bg-slate-900 border border-slate-800 rounded-xl p-5 font-semibold hover:border-blue-500 transition"
          >
            View Customers
          </Link>

          <Link
            href="/admin/boat-builds"
            className="bg-slate-900 border border-slate-800 rounded-xl p-5 font-semibold hover:border-blue-500 transition"
          >
            Boat Projects
          </Link>

        </div>

      </section>

      {/* RECENT ORDERS */}

      <section>

        <div className="flex items-center justify-between mb-5">

          <div>
            <h2 className="text-2xl font-bold">
              Recent Orders
            </h2>

            <p className="text-slate-500 mt-1">
              Latest activity from your customers.
            </p>
          </div>

          <Link
            href="/admin/orders"
            className="text-blue-400 hover:text-blue-300"
          >
            View all →
          </Link>

        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">

          {recentOrders.length === 0 ? (

            <div className="p-10 text-center text-slate-500">
              No orders yet.
            </div>

          ) : (

            <div className="overflow-x-auto">

              <table className="w-full">

                <thead className="bg-black">

                  <tr className="border-b border-slate-800">

                    <th className="text-left px-6 py-4 text-sm text-slate-400">
                      Order
                    </th>

                    <th className="text-left px-6 py-4 text-sm text-slate-400">
                      Customer
                    </th>

                    <th className="text-left px-6 py-4 text-sm text-slate-400">
                      Amount
                    </th>

                    <th className="text-left px-6 py-4 text-sm text-slate-400">
                      Status
                    </th>

                  </tr>

                </thead>

                <tbody>

                  {recentOrders.map((order) => (

                    <tr
                      key={order.id}
                      className="border-b border-slate-800 hover:bg-slate-800/50 transition"
                    >

                      <td className="px-6 py-5 font-semibold">
                        #{order.id}
                      </td>

                      <td className="px-6 py-5">
                        {order.customer_name || 'Unknown'}
                      </td>

                      <td className="px-6 py-5 font-semibold">
                        ₦
                        {Number(
                          order.total_price || 0
                        ).toLocaleString()}
                      </td>

                      <td className="px-6 py-5">

                        <span
                          className={`inline-flex px-3 py-1 rounded-full border text-xs font-medium ${statusStyle(
                            order.status
                          )}`}
                        >
                          {order.status || 'Pending'}
                        </span>

                      </td>

                    </tr>

                  ))}

                </tbody>

              </table>

            </div>

          )}

        </div>

      </section>

    </main>
  )
}
