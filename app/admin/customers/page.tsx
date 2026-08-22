'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

type Customer = {
  created_at: string
  name: string | null
  email: string | null
  phone: string | null
}

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  async function loadCustomers() {
    setLoading(true)
    setError('')

    const { data, error } = await supabase
      .from('customers')
      .select('created_at, name, email, phone')
      .order('created_at', { ascending: false })

    console.log('Customers:', data)
    console.log('Supabase error:', error)

    if (error) {
      setError(error.message)
      setCustomers([])
    } else {
      setCustomers(data || [])
    }

    setLoading(false)
  }

  useEffect(() => {
    loadCustomers()
  }, [])

  return (
    <main className="max-w-7xl mx-auto p-6 md:p-10">

      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold">
            Customers
          </h1>

          <p className="text-gray-500 mt-2">
            Manage your Data Marine customers
          </p>
        </div>

        <button
          onClick={loadCustomers}
          disabled={loading}
          className="bg-slate-900 text-white px-5 py-2 rounded-lg disabled:opacity-50"
        >
          {loading ? 'Loading...' : 'Refresh'}
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-300 text-red-700 p-4 rounded-lg mb-6">
          <strong>Database error:</strong>
          <p>{error}</p>
        </div>
      )}

      {loading && (
        <div className="py-10 text-center">
          Loading customers...
        </div>
      )}

      {!loading && !error && customers.length === 0 && (
        <div className="bg-white border rounded-xl p-10 text-center">
          <h2 className="text-xl font-semibold">
            No customers yet
          </h2>

          <p className="text-gray-500 mt-2">
            Customers will appear here when they register or place an order.
          </p>
        </div>
      )}

      {!loading && !error && customers.length > 0 && (
        <div className="bg-white border rounded-xl overflow-hidden shadow-sm">

          <div className="overflow-x-auto">

            <table className="w-full">

              <thead className="bg-slate-900 text-white">
                <tr>
                  <th className="text-left px-6 py-4">
                    Name
                  </th>

                  <th className="text-left px-6 py-4">
                    Email
                  </th>

                  <th className="text-left px-6 py-4">
                    Phone
                  </th>

                  <th className="text-left px-6 py-4">
                    Created At
                  </th>
                </tr>
              </thead>

              <tbody>

                {customers.map((customer, index) => (

                  <tr
                    key={`${customer.email}-${index}`}
                    className="border-b hover:bg-gray-50"
                  >

                    <td className="px-6 py-4 font-medium">
                      {customer.name || 'No name'}
                    </td>

                    <td className="px-6 py-4">
                      {customer.email || 'No email'}
                    </td>

                    <td className="px-6 py-4">
                      {customer.phone || 'No phone'}
                    </td>

                    <td className="px-6 py-4">
                      {customer.created_at
                        ? new Date(
                            customer.created_at
                          ).toLocaleString()
                        : '—'}
                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          </div>

        </div>
      )}

    </main>
  )
}
