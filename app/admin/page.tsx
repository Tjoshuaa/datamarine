'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

type Stats = {
  products: number
  orders: number
  customers: number
  boatBuilds: number
  revenue: number
  pendingOrders: number
  processingOrders: number
  deliveredOrders: number
  lowStock: number
}

type Order = {
  id: number
  customer_name: string | null
  total_price: number | null
  status: string | null
  payment_status: string | null
  created_at: string
}

type LowStockProduct = {
  id: number
  name: string
  stock: number | null
}

export default function Dashboard() {
  const [stats, setStats] = useState<Stats>({
    products: 0,
    orders: 0,
    customers: 0,
    boatBuilds: 0,
    revenue: 0,
    pendingOrders: 0,
    processingOrders: 0,
    deliveredOrders: 0,
    lowStock: 0,
  })

  const [recentOrders, setRecentOrders] = useState<Order[]>([])
  const [lowStockProducts, setLowStockProducts] = useState<
    LowStockProduct[]
  >([])

  const [loading, setLoading] = useState(true)

  async function loadDashboard() {
    setLoading(true)

    try {
      const [
        productsResult,
        ordersResult,
        customersResult,
        boatBuildsResult,
        lowStockResult,
      ] = await Promise.all([
        supabase
          .from('products')
          .select('*', {
            count: 'exact',
            head: true,
          }),

        supabase
          .from('orders')
          .select(
            'id, customer_name, total_price, status, payment_status, created_at'
          )
          .order('created_at', {
            ascending: false,
          }),

        supabase
          .from('customers')
          .select('*', {
            count: 'exact',
            head: true,
          }),

        supabase
          .from('boat_builds')
          .select('*', {
            count: 'exact',
            head: true,
          }),

        supabase
          .from('products')
          .select('id, name, stock')
          .lte('stock', 5)
          .eq('active', true)
          .order('stock', {
            ascending: true,
          })
          .limit(5),
      ])

      const orders = ordersResult.data || []

      const revenue = orders.reduce(
        (total, order) =>
          total + Number(order.total_price || 0),
        0
      )

      const pendingOrders = orders.filter(
        order =>
          order.status?.toLowerCase() === 'pending'
      ).length

      const processingOrders = orders.filter(
        order =>
          order.status?.toLowerCase() === 'processing'
      ).length

      const deliveredOrders = orders.filter(
        order =>
          order.status?.toLowerCase() === 'delivered'
      ).length

      setStats({
        products: productsResult.count || 0,
        orders: orders.length,
        customers: customersResult.count || 0,
        boatBuilds: boatBuildsResult.count || 0,
        revenue,
        pendingOrders,
        processingOrders,
        deliveredOrders,
        lowStock: lowStockResult.data?.length || 0,
      })

      setRecentOrders(
        orders.slice(0, 5)
      )

      setLowStockProducts(
        lowStockResult.data || []
      )

    } catch (error) {
      console.error(
        'Dashboard error:',
        error
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadDashboard()
  }, [])

  function statusStyle(
    status: string | null
  ) {
    switch (status?.toLowerCase()) {
      case 'delivered':
        return 'bg-green-950 text-green-400 border-green-800'

      case 'shipped':
        return 'bg-blue-950 text-blue-400 border-blue-800'

      case 'processing':
        return 'bg-yellow-950 text-yellow-400 border-yellow-800'

      case 'cancelled':
        return 'bg-red-950 text-red-400 border-red-800'

      case 'pending':
        return 'bg-orange-950 text-orange-400 border-orange-800'

      default:
        return 'bg-slate-800 text-slate-300 border-slate-700'
    }
  }

  function formatMoney(
    amount: number
  ) {
    return `₦${amount.toLocaleString()}`
  }

  const mainCards = [
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
      description: 'Customer orders',
    },

    {
      title: 'Customers',
      value: stats.customers,
      href: '/admin/customers',
      icon: '👥',
      description: 'Registered customers',
    },

    {
      title: 'Boat Builds',
      value: stats.boatBuilds,
      href: '/admin/boat-builds',
      icon: '🚤',
      description: 'Custom boat projects',
    },
    {
  title: "Boats We've Built",
  value: 0,
  href: '/admin/boats-built',
  icon: '🛥️',
  description: 'Manage completed boats',
},
  ]

  return (
    <main className="min-h-screen bg-black text-white p-6 md:p-10">

      {/* HEADER */}

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5 mb-10">

        <div>

          <p className="text-sm uppercase tracking-[0.25em] text-blue-400">
            DATA MARINE ⚓
          </p>

          <h1 className="text-4xl md:text-5xl font-bold mt-2">
            Administration
          </h1>

          <p className="text-slate-400 mt-2">
            Control center for your marine business.
          </p>

        </div>

        <div className="flex gap-3">

          <Link
            href="/"
            className="bg-slate-900 border border-slate-800 px-5 py-3 rounded-xl font-semibold hover:border-blue-500 transition"
          >
            View Website
          </Link>

          <button
            onClick={loadDashboard}
            disabled={loading}
            className="bg-white text-black px-5 py-3 rounded-xl font-semibold hover:bg-slate-200 disabled:opacity-50 transition"
          >
            {loading
              ? 'Refreshing...'
              : '↻ Refresh'}
          </button>

        </div>

      </div>


      {/* MAIN STATISTICS */}

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-6">

        {mainCards.map(card => (

          <Link
            key={card.href}
            href={card.href}
            className="group bg-slate-900 border border-slate-800 rounded-2xl p-6 hover:border-blue-500 hover:-translate-y-1 transition"
          >

            <div className="flex items-start justify-between">

              <div className="text-3xl">
                {card.icon}
              </div>

              <span className="text-slate-500 group-hover:text-blue-400">
                →
              </span>

            </div>

            <p className="text-slate-400 mt-6">
              {card.title}
            </p>

            <p className="text-4xl font-bold mt-1">
              {loading
                ? '—'
                : card.value}
            </p>

            <p className="text-sm text-slate-500 mt-2">
              {card.description}
            </p>

          </Link>

        ))}

      </div>


      {/* BUSINESS OVERVIEW */}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5 mb-10">

        {/* REVENUE */}

        <div className="bg-gradient-to-br from-green-950 to-slate-900 border border-green-900 rounded-2xl p-6">

          <div className="flex items-center justify-between">

            <div>

              <p className="text-green-300 text-sm">
                Total Order Value
              </p>

              <h2 className="text-3xl font-bold mt-2">
                {loading
                  ? '—'
                  : formatMoney(stats.revenue)}
              </h2>

            </div>

            <div className="text-3xl">
              💰
            </div>

          </div>

          <p className="text-green-400/70 text-sm mt-4">
            Based on recorded orders
          </p>

        </div>


        {/* PENDING */}

        <Link
          href="/admin/orders"
          className="bg-gradient-to-br from-orange-950 to-slate-900 border border-orange-900 rounded-2xl p-6 hover:border-orange-500 transition"
        >

          <div className="flex items-center justify-between">

            <div>

              <p className="text-orange-300 text-sm">
                Pending Orders
              </p>

              <h2 className="text-3xl font-bold mt-2">
                {loading
                  ? '—'
                  : stats.pendingOrders}
              </h2>

            </div>

            <div className="text-3xl">
              ⏳
            </div>

          </div>

          <p className="text-orange-400/70 text-sm mt-4">
            Orders waiting for action
          </p>

        </Link>


        {/* PROCESSING */}

        <Link
          href="/admin/orders"
          className="bg-gradient-to-br from-yellow-950 to-slate-900 border border-yellow-900 rounded-2xl p-6 hover:border-yellow-500 transition"
        >

          <div className="flex items-center justify-between">

            <div>

              <p className="text-yellow-300 text-sm">
                Processing
              </p>

              <h2 className="text-3xl font-bold mt-2">
                {loading
                  ? '—'
                  : stats.processingOrders}
              </h2>

            </div>

            <div className="text-3xl">
              ⚙️
            </div>

          </div>

          <p className="text-yellow-400/70 text-sm mt-4">
            Orders being prepared
          </p>

        </Link>


        {/* DELIVERED */}

        <Link
          href="/admin/orders"
          className="bg-gradient-to-br from-blue-950 to-slate-900 border border-blue-900 rounded-2xl p-6 hover:border-blue-500 transition"
        >

          <div className="flex items-center justify-between">

            <div>

              <p className="text-blue-300 text-sm">
                Delivered
              </p>

              <h2 className="text-3xl font-bold mt-2">
                {loading
                  ? '—'
                  : stats.deliveredOrders}
              </h2>

            </div>

            <div className="text-3xl">
              ✅
            </div>

          </div>

          <p className="text-blue-400/70 text-sm mt-4">
            Successfully completed
          </p>

        </Link>

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
            <span className="text-xl">
              +
            </span>

            <span className="block mt-2">
              Add Product
            </span>

          </Link>


          <Link
            href="/admin/orders"
            className="bg-slate-900 border border-slate-800 rounded-xl p-5 font-semibold hover:border-blue-500 transition"
          >
            🛒

            <span className="block mt-2">
              View Orders
            </span>

          </Link>


          <Link
            href="/admin/customers"
            className="bg-slate-900 border border-slate-800 rounded-xl p-5 font-semibold hover:border-blue-500 transition"
          >
            👥

            <span className="block mt-2">
              View Customers
            </span>

          </Link>


          <Link
            href="/admin/boat-builds"
            className="bg-slate-900 border border-slate-800 rounded-xl p-5 font-semibold hover:border-blue-500 transition"
          >
            🚤

            <span className="block mt-2">
              Boat Projects
            </span>

          </Link>

        </div>

      </section>


      {/* RECENT ORDERS */}

      <section className="mb-10">

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

            <div className="p-10 text-center">

              <div className="text-4xl mb-3">
                🛒
              </div>

              <p className="text-slate-400">
                No orders yet.
              </p>

              <p className="text-slate-600 text-sm mt-1">
                New orders will appear here.
              </p>

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

                    <th className="text-left px-6 py-4 text-sm text-slate-400">
                      Date
                    </th>

                  </tr>

                </thead>

                <tbody>

                  {recentOrders.map(order => (

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

                      <td className="px-6 py-5 font-semibold text-blue-400">
                        {formatMoney(
                          Number(order.total_price || 0)
                        )}
                      </td>

                      <td className="px-6 py-5">

                        <span
                          className={`inline-flex px-3 py-1 rounded-full border text-xs font-medium capitalize ${statusStyle(
                            order.status
                          )}`}
                        >
                          {order.status || 'Pending'}
                        </span>

                      </td>

                      <td className="px-6 py-5 text-slate-500 text-sm whitespace-nowrap">
                        {new Date(
                          order.created_at
                        ).toLocaleDateString()}
                      </td>

                    </tr>

                  ))}

                </tbody>

              </table>

            </div>

          )}

        </div>

      </section>


      {/* LOW STOCK */}

      <section className="mb-10">

        <div className="flex items-center justify-between mb-5">

          <div>

            <h2 className="text-2xl font-bold">
              Inventory Alerts
            </h2>

            <p className="text-slate-500 mt-1">
              Products that may need restocking.
            </p>

          </div>

          <Link
            href="/admin/products"
            className="text-blue-400 hover:text-blue-300"
          >
            Manage inventory →
          </Link>

        </div>


        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">

          {lowStockProducts.length === 0 ? (

            <div className="p-8 flex items-center gap-4">

              <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center">
                ✅
              </div>

              <div>

                <p className="font-semibold">
                  Inventory looks good
                </p>

                <p className="text-sm text-slate-500">
                  No active products currently have 5 or fewer items in stock.
                </p>

              </div>

            </div>

          ) : (

            <div>

              {lowStockProducts.map(product => (

                <div
                  key={product.id}
                  className="flex items-center justify-between px-6 py-5 border-b border-slate-800 last:border-0"
                >

                  <div>

                    <p className="font-semibold">
                      {product.name}
                    </p>

                    <p className="text-sm text-slate-500">
                      Product ID #{product.id}
                    </p>

                  </div>

                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold border ${
                      Number(product.stock || 0) === 0
                        ? 'bg-red-950 text-red-400 border-red-800'
                        : 'bg-orange-950 text-orange-400 border-orange-800'
                    }`}
                  >
                    {Number(product.stock || 0) === 0
                      ? 'Out of stock'
                      : `${product.stock} left`}
                  </span>

                </div>

              ))}

            </div>

          )}

        </div>

      </section>


      {/* SYSTEM STATUS */}

      <section>

        <h2 className="text-2xl font-bold mb-5">
          System Status
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">

            <div className="flex items-center gap-3">

              <span className="w-3 h-3 rounded-full bg-green-500" />

              <p className="font-semibold">
                Website
              </p>

            </div>

            <p className="text-slate-500 text-sm mt-2">
              Online and operational
            </p>

          </div>


          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">

            <div className="flex items-center gap-3">

              <span className="w-3 h-3 rounded-full bg-green-500" />

              <p className="font-semibold">
                Database
              </p>

            </div>

            <p className="text-slate-500 text-sm mt-2">
              Supabase connected
            </p>

          </div>


          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">

            <div className="flex items-center gap-3">

              <span className="w-3 h-3 rounded-full bg-green-500" />

              <p className="font-semibold">
                Email Notifications
              </p>

            </div>

            <p className="text-slate-500 text-sm mt-2">
              Order notifications active
            </p>

          </div>

        </div>

      </section>

    </main>
  )
}
