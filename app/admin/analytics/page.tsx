'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import DashboardCard from '@/components/admin/DashboardCard'

export default function AnalyticsPage() {
  const [products, setProducts] = useState(0)
  const [orders, setOrders] = useState(0)
  const [revenue, setRevenue] = useState(0)

  useEffect(() => {
    loadAnalytics()
  }, [])

  async function loadAnalytics() {
    const { count } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true })

    const { data } = await supabase
      .from('orders')
      .select('total_price')

    setProducts(count || 0)
    setOrders(data?.length || 0)

    const total =
      data?.reduce(
        (sum, item) => sum + Number(item.total_price),
        0
      ) || 0

    setRevenue(total)
  }

  return (
    <main>

      <h1 className="text-4xl font-bold text-white mb-8">
        Business Analytics
      </h1>

      <div className="grid gap-6 md:grid-cols-3">

        <DashboardCard
          title="Products"
          value={products}
        />

        <DashboardCard
          title="Orders"
          value={orders}
          color="text-green-400"
        />

        <DashboardCard
          title="Revenue"
          value={`₦${revenue.toLocaleString()}`}
          color="text-yellow-400"
        />

      </div>

    </main>
  )
}