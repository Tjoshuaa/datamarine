'use client'

import { useEffect, useMemo, useState } from 'react'
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
  const [search, setSearch] = useState('')

  async function loadCustomers() {
    setLoading(true)
    setError('')

    const { data, error } = await supabase
      .from('customers')
      .select('created_at, name, email, phone')
      .order('created_at', { ascending: false })

    if (error) {
      console.error(error)
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

  const filteredCustomers = useMemo(() => {
    const term = search.toLowerCase().trim()

    if (!term) return customers

    return customers.filter((customer) =>
      [
        customer.name,
        customer.email,
        customer.phone,
      ]
        .filter(Boolean)
        .some((value) =>
          value!.toLowerCase().includes(term)
        )
    )
  }, [customers, search])

  const newCustomers = customers.filter((customer) => {
    const date = new Date(customer.created_at)
    const now = new Date()

    return (
      date.getMonth() === now.getMonth() &&
      date.getFullYear() === now.getFullYear()
    )
  }).length

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

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-10">

        <div>
          <p className="text-sm text-slate-400 uppercase tracking-wider">
            Administration
          </p>

          <h1 className="text-4xl font-bold mt-2">
            Customers
          </h1>

          <p className="text-slate-400 mt-2">
            Manage customers who interact with Data Marine.
          </p>
        </div>

        <button
          onClick={loadCustomers}
          disabled={loading}
          className="bg-white text-black px-5 py-3 rounded-lg font-semibold hover:bg-slate-200 disabled:opacity-50"
        >
          {loading ? 'Refreshing...' : '↻ Refresh'}
        </button>

      </div>

      {/* STAT CARDS */}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <p className="text-slate-400">
            Total Customers
          </p>

          <p className="text-3xl font-bold mt-2">
            {customers.length}
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <p className="text-slate-400">
            New This Month
          </p>

          <p className="text-3xl font-bold mt-2">
            {newCustomers}
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <p className="text-slate-400">
            Showing
          </p>

          <p className="text-3xl font-bold mt-2">
            {filteredCustomers.length}
          </p>
        </div>

      </div>

      {/* SEARCH */}

      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 mb-6">

        <div className="relative">

          <input
            type="text"
            placeholder="Search by name, email or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-black border border-slate-700 rounded-xl px-5 py-3 text-white placeholder-slate-500 outline-none focus:border-white"
          />

        </div>

      </div>

      {/* ERROR */}

      {error && (
        <div className="bg-red-950 border border-red-800 text-red-300 p-5 rounded-xl mb-6">
          <p className="font-semibold">
            Unable to load customers
          </p>

          <p className="mt-1 text-sm">
            {error}
          </p>
        </div>
      )}

      {/* LOADING */}

      {loading && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-10 text-center">
          <p className="text-slate-400">
            Loading customers...
          </p>
        </div>
      )}

      {/* EMPTY */}

      {!loading && !error && filteredCustomers.length === 0 && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center">

          <div className="text-5xl mb-4">
            👤
          </div>

          <h2 className="text-xl font-bold">
            {search
              ? 'No customers found'
              : 'No customers yet'}
          </h2>

          <p className="text-slate-400 mt-2">
            {search
              ? 'Try another name, email or phone number.'
              : 'Customers will appear here when they place an order.'}
          </p>

        </div>
      )}

      {/* CUSTOMER TABLE */}

      {!loading && !error && filteredCustomers.length > 0 && (

        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">

          <div className="overflow-x-auto">

            <table className="w-full">

              <thead className="bg-black">

                <tr className="border-b border-slate-800">

                  <th className="text-left px-6 py-5 text-sm font-semibold text-slate-300">
                    Customer
                  </th>

                  <th className="text-left px-6 py-5 text-sm font-semibold text-slate-300">
                    Contact
                  </th>

                  <th className="text-left px-6 py-5 text-sm font-semibold text-slate-300">
                    Joined
                  </th>

                  <th className="text-right px-6 py-5 text-sm font-semibold text-slate-300">
                    Actions
                  </th>

                </tr>

              </thead>

              <tbody>

                {filteredCustomers.map((customer, index) => (

                  <tr
                    key={`${customer.email}-${customer.phone}-${index}`}
                    className="border-b border-slate-800 hover:bg-slate-800/60 transition"
                  >

                    {/* CUSTOMER */}

                    <td className="px-6 py-5">

                      <div className="flex items-center gap-4">

                        <div className="w-11 h-11 rounded-full bg-slate-700 flex items-center justify-center font-bold">
                          {(customer.name || 'C')
                            .charAt(0)
                            .toUpperCase()}
                        </div>

                        <div>

                          <p className="font-semibold">
                            {customer.name || 'Unknown Customer'}
                          </p>

                          <p className="text-sm text-slate-500">
                            Customer #{index + 1}
                          </p>

                        </div>

                      </div>

                    </td>

                    {/* CONTACT */}

                    <td className="px-6 py-5">

                      <p className="text-sm">
                        {customer.email || 'No email'}
                      </p>

                      <p className="text-sm text-slate-400 mt-1">
                        {customer.phone || 'No phone'}
                      </p>

                    </td>

                    {/* DATE */}

                    <td className="px-6 py-5 text-sm text-slate-400">

                      {customer.created_at
                        ? new Date(
                            customer.created_at
                          ).toLocaleDateString()
                        : '—'}

                    </td>

                    {/* ACTIONS */}

                    <td className="px-6 py-5">

                      <div className="flex justify-end gap-2">

                        {customer.phone && (

                          <a
                            href={whatsappLink(customer.phone)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white text-sm font-medium"
                          >
                            WhatsApp
                          </a>

                        )}

                        {customer.email && (

                          <a
                            href={`mailto:${customer.email}`}
                            className="px-3 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium"
                          >
                            Email
                          </a>

                        )}

                      </div>

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
