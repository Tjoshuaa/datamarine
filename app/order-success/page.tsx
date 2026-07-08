'use client'

import Link from 'next/link'

export default function OrderSuccess() {
  return (
    <main className="min-h-screen bg-black text-white flex items-center justify-center">

      <div className="text-center">

        <h1 className="text-4xl font-bold text-green-500">
          Order Placed Successfully 🎉
        </h1>

        <p className="mt-4 text-gray-400">
          We will contact you shortly.
        </p>

        <Link
          href="/marketplace"
          className="inline-block mt-6 bg-blue-600 px-6 py-3 rounded"
        >
          Continue Shopping
        </Link>

      </div>

    </main>
  )
}