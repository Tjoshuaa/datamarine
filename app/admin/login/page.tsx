'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { loginAdmin } from '@/lib/auth'

export default function AdminLogin() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  async function handleLogin() {
    const success = loginAdmin(password)

    if (success) {
      router.replace('/admin/orders')
    } else {
      setError('Wrong password')
    }
  }

  return (
    <main className="max-w-md mx-auto p-10">

      <h1 className="text-4xl font-bold mb-6">
        Admin Login
      </h1>

      <input
        type="password"
        placeholder="Enter password"
        className="w-full p-3 border"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      {error && (
        <p className="text-red-600 mt-2">
          {error}
        </p>
      )}

      <button
        onClick={handleLogin}
        className="mt-5 bg-blue-600 text-white px-6 py-3 rounded"
      >
        Login
      </button>

    </main>
  )
}