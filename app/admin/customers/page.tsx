'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

type Customer = {
  id: number
  name: string
  email: string
  phone: string
  created_at: string
}

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    loadCustomers()
  }, [])

  async function loadCustomers() {
    setLoading(true)
    setErrorMessage('')

    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error loading customers:', error)
      setErrorMessage(error.message)
      setCustomers([])
    } else {
      setCustomers(data || [])
    }

    setLoading(false)
  }

  return (
    <main className="max-w-7xl mx-auto p-10">

      <div className="flex items-center justify-between mb-10">
        <h1 className="text-4xl font-bold">
          Customers
        </h1>

        <button
          onClick={loadCustomers}
          disabled={loading}
          className="bg-slate-900 text-white px-5 py-2 rounded-lg disabled:opacity-50"
        >
          {loading ? 'Loading...' : 'Refresh'}
        </button>
      </div>

      {errorMessage && (
        <div className="mb-6 rounded-lg border border-red-300 bg-red-50 p-4 text-red-700">
          <strong>Unable to load customers:</strong>
          <p className="mt-1">{errorMessage}</p>
        </div>
      )}

      {loading && !errorMessage && (
        <p className="text-gray-500">
          Loading customers...
        </p>
      )}

      {!loading && !errorMessage && customers.length === 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          No customers found.
        </div>
      )}

      {!loading && customers.length > 0 && (
        <div className="overflow-x-auto bg-white rounded-lg shadow">

          <table className="w-full">

            <thead className="bg-slate-900 text-white">
              <tr>
                <th className="text-left p-4">Name</th>
                <th className="text-left p-4">Email</th>
                <th className="text-left p-4">Phone</th>
                <th className="text-left p-4">Joined</th>
              </tr>
            </thead>

            <tbody>

              {customers.map(customer => (

                <tr
                  key={customer.id}
                  className="border-b hover:bg-gray-50"
                >

                  <td className="p-4 font-medium">
                    {customer.name || '—'}
                  </td>

                  <td className="p-4">
                    {customer.email || '—'}
                  </td>

                  <td className="p-4">
                    {customer.phone || '—'}
                  </td>

                  <td className="p-4">
                    {customer.created_at
                      ? new Date(customer.created_at).toLocaleDateString()
                      : '—'}
                  </td>

                </tr>

              ))}

            </tbody>

          </table>

        </div>
      )}

    </main>
  )
}
