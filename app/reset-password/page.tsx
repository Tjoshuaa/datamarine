'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function ResetPasswordPage() {
  const router = useRouter()

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [checking, setChecking] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    async function checkSession() {
      const { data } = await supabase.auth.getSession()

      if (!data.session) {
        setError(
          'This password reset link is invalid or has expired. Please request a new one.'
        )
      }

      setChecking(false)
    }

    checkSession()
  }, [])

  async function handleUpdatePassword(
    e: React.FormEvent
  ) {
    e.preventDefault()

    setError('')

    if (password.length < 6) {
      setError(
        'Password must be at least 6 characters.'
      )
      return
    }

    if (password !== confirmPassword) {
      setError(
        'Passwords do not match.'
      )
      return
    }

    setLoading(true)

    const { error } =
      await supabase.auth.updateUser({
        password,
      })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    setSuccess(true)
    setLoading(false)

    setTimeout(() => {
      router.replace('/login')
    }, 2000)
  }

  if (checking) {
    return (
      <main className="min-h-screen bg-black text-white flex items-center justify-center p-6">
        <p className="text-slate-400">
          Checking password reset link...
        </p>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-black text-white flex items-center justify-center p-6">

      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-8">

        <p className="text-sm uppercase tracking-widest text-blue-400">
          DATA MARINE ⚓
        </p>

        <h1 className="text-3xl font-bold mt-3">
          Set New Password
        </h1>

        <p className="text-slate-400 mt-2 mb-8">
          Create a new password for your Data Marine admin account.
        </p>

        {success ? (

          <div className="bg-green-950 border border-green-800 text-green-300 rounded-xl p-4">
            Password updated successfully.

            <p className="text-sm mt-2">
              Redirecting you to the admin login...
            </p>
          </div>

        ) : error ? (

          <div>

            <div className="bg-red-950 border border-red-800 text-red-300 rounded-xl p-4 mb-6">
              {error}
            </div>

            <button
              onClick={() => router.replace('/login')}
              className="w-full bg-white text-black py-3 rounded-xl font-semibold"
            >
              Go to Login
            </button>

          </div>

        ) : (

          <form
            onSubmit={handleUpdatePassword}
            className="space-y-5"
          >

            <div>

              <label className="block text-sm text-slate-400 mb-2">
                New Password
              </label>

              <input
                type="password"
                value={password}
                onChange={e =>
                  setPassword(e.target.value)
                }
                placeholder="Enter new password"
                className="w-full bg-black border border-slate-700 rounded-xl p-3 outline-none focus:border-blue-500"
                required
              />

            </div>

            <div>

              <label className="block text-sm text-slate-400 mb-2">
                Confirm Password
              </label>

              <input
                type="password"
                value={confirmPassword}
                onChange={e =>
                  setConfirmPassword(e.target.value)
                }
                placeholder="Confirm new password"
                className="w-full bg-black border border-slate-700 rounded-xl p-3 outline-none focus:border-blue-500"
                required
              />

            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 py-3 rounded-xl font-bold disabled:opacity-50"
            >
              {loading
                ? 'Updating Password...'
                : 'Set New Password'}
            </button>

          </form>

        )}

      </div>

    </main>
  )
}
