'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { loginAdmin } from '@/lib/auth'

export default function AdminLogin() {
  const router = useRouter()

  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  function handleLogin() {
    setError('')

    const success = loginAdmin(password)

    if (success) {
      router.replace('/admin')
      return
    }

    setError('Wrong password')
  }

  return (
    <main className="min-h-screen bg-black text-white flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-8">

        <div className="text-center mb-8">
          <p className="text-sm uppercase tracking-[0.25em] text-blue-400">
            DATA MARINE ⚓
          </p>

          <h1 className="text-3xl font-bold mt-3">
            Admin Login
          </h1>

          <p className="text-slate-400 mt-2">
            Sign in to access the administration dashboard.
          </p>
        </div>

        <label className="block text-sm font-semibold mb-2">
          Admin Password
        </label>

        <input
          type="password"
          placeholder="Enter password"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value)
            setError('')
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              handleLogin()
            }
          }}
          className="w-full bg-black border border-slate-700 rounded-xl p-4 text-white outline-none focus:border-blue-500"
        />

        {error && (
          <p className="text-red-400 text-sm mt-3">
            {error}
          </p>
        )}

        <button
          type="button"
          onClick={handleLogin}
          className="w-full mt-5 bg-blue-600 hover:bg-blue-700 text-white px-6 py-4 rounded-xl font-bold transition"
        >
          Login
        </button>

      </div>
    </main>
  )
}
