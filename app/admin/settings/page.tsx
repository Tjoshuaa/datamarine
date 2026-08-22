'use client'

import { useState } from 'react'

export default function SettingsPage() {
  const [businessName, setBusinessName] = useState('DATA MARINE NIG LTD')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [whatsapp, setWhatsapp] = useState('')
  const [instagram, setInstagram] = useState('datamarinebb')
  const [address, setAddress] = useState('Port Harcourt, Rivers State, Nigeria')

  const [orderNotifications, setOrderNotifications] = useState(true)
  const [emailNotifications, setEmailNotifications] = useState(true)
  const [whatsappNotifications, setWhatsappNotifications] = useState(true)

  const [message, setMessage] = useState('')

  function saveSettings() {
    setMessage('Settings saved successfully.')

    setTimeout(() => {
      setMessage('')
    }, 3000)
  }

  return (
    <main className="text-white max-w-6xl">

      {/* HEADER */}

      <div className="mb-10">

        <p className="text-sm uppercase tracking-widest text-blue-400">
          DATA MARINE ADMIN
        </p>

        <h1 className="text-4xl font-bold mt-2">
          Settings
        </h1>

        <p className="text-gray-400 mt-2">
          Manage your website, business information and notifications.
        </p>

      </div>

      {/* SUCCESS MESSAGE */}

      {message && (

        <div className="mb-6 bg-green-950 border border-green-800 text-green-300 p-4 rounded-xl">
          ✓ {message}
        </div>

      )}

      <div className="space-y-8">

        {/* BUSINESS INFORMATION */}

        <section className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 md:p-8">

          <div className="mb-6">

            <h2 className="text-2xl font-bold">
              Business Information
            </h2>

            <p className="text-gray-400 mt-1">
              Information about your Data Marine business.
            </p>

          </div>

          <div className="grid md:grid-cols-2 gap-5">

            <div>
              <label className="block text-sm font-semibold mb-2">
                Business Name
              </label>

              <input
                value={businessName}
                onChange={e => setBusinessName(e.target.value)}
                className="w-full bg-black border border-zinc-700 rounded-lg p-3 outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">
                Business Email
              </label>

              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="business@example.com"
                className="w-full bg-black border border-zinc-700 rounded-lg p-3 outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">
                Phone Number
              </label>

              <input
                value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder="08012345678"
                className="w-full bg-black border border-zinc-700 rounded-lg p-3 outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">
                WhatsApp Number
              </label>

              <input
                value={whatsapp}
                onChange={e => setWhatsapp(e.target.value)}
                placeholder="2348012345678"
                className="w-full bg-black border border-zinc-700 rounded-lg p-3 outline-none focus:border-blue-500"
              />

              <p className="text-xs text-gray-500 mt-2">
                Use international format without +.
              </p>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">
                Instagram Handle
              </label>

              <div className="flex">

                <span className="bg-zinc-800 border border-zinc-700 border-r-0 rounded-l-lg px-4 flex items-center text-gray-400">
                  @
                </span>

                <input
                  value={instagram}
                  onChange={e => setInstagram(e.target.value)}
                  className="w-full bg-black border border-zinc-700 rounded-r-lg p-3 outline-none focus:border-blue-500"
                />

              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">
                Business Address
              </label>

              <input
                value={address}
                onChange={e => setAddress(e.target.value)}
                className="w-full bg-black border border-zinc-700 rounded-lg p-3 outline-none focus:border-blue-500"
              />
            </div>

          </div>

        </section>

        {/* WEBSITE SETTINGS */}

        <section className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 md:p-8">

          <h2 className="text-2xl font-bold">
            Website Settings
          </h2>

          <p className="text-gray-400 mt-1 mb-6">
            General settings for the Data Marine website.
          </p>

          <div className="grid md:grid-cols-2 gap-5">

            <div className="bg-black border border-zinc-800 rounded-xl p-5">

              <p className="text-gray-400 text-sm">
                Currency
              </p>

              <p className="text-xl font-bold mt-1">
                Nigerian Naira (₦)
              </p>

            </div>

            <div className="bg-black border border-zinc-800 rounded-xl p-5">

              <p className="text-gray-400 text-sm">
                Website Status
              </p>

              <div className="flex items-center gap-2 mt-2">

                <span className="w-3 h-3 bg-green-500 rounded-full" />

                <p className="font-bold text-green-400">
                  Online
                </p>

              </div>

            </div>

          </div>

        </section>

        {/* NOTIFICATIONS */}

        <section className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 md:p-8">

          <h2 className="text-2xl font-bold">
            Notifications
          </h2>

          <p className="text-gray-400 mt-1 mb-6">
            Choose how you want to receive business notifications.
          </p>

          <div className="space-y-4">

            {/* ORDER NOTIFICATIONS */}

            <label className="flex items-center justify-between bg-black border border-zinc-800 rounded-xl p-5 cursor-pointer">

              <div>

                <p className="font-semibold">
                  New Order Notifications
                </p>

                <p className="text-sm text-gray-500 mt-1">
                  Get notified whenever a customer places an order.
                </p>

              </div>

              <input
                type="checkbox"
                checked={orderNotifications}
                onChange={e =>
                  setOrderNotifications(e.target.checked)
                }
                className="w-5 h-5 accent-blue-600"
              />

            </label>

            {/* EMAIL */}

            <label className="flex items-center justify-between bg-black border border-zinc-800 rounded-xl p-5 cursor-pointer">

              <div>

                <p className="font-semibold">
                  Email Notifications
                </p>

                <p className="text-sm text-gray-500 mt-1">
                  Receive important website notifications by email.
                </p>

              </div>

              <input
                type="checkbox"
                checked={emailNotifications}
                onChange={e =>
                  setEmailNotifications(e.target.checked)
                }
                className="w-5 h-5 accent-blue-600"
              />

            </label>

            {/* WHATSAPP */}

            <label className="flex items-center justify-between bg-black border border-zinc-800 rounded-xl p-5 cursor-pointer">

              <div>

                <p className="font-semibold">
                  WhatsApp Notifications
                </p>

                <p className="text-sm text-gray-500 mt-1">
                  Receive new order notifications on WhatsApp.
                </p>

              </div>

              <input
                type="checkbox"
                checked={whatsappNotifications}
                onChange={e =>
                  setWhatsappNotifications(e.target.checked)
                }
                className="w-5 h-5 accent-blue-600"
              />

            </label>

          </div>

        </section>

        {/* SOCIAL MEDIA */}

        <section className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 md:p-8">

          <h2 className="text-2xl font-bold">
            Social Media
          </h2>

          <p className="text-gray-400 mt-1 mb-6">
            Your social media accounts displayed on the website.
          </p>

          <div className="bg-black border border-zinc-800 rounded-xl p-5">

            <div className="flex items-center justify-between">

              <div>

                <p className="font-semibold">
                  Instagram
                </p>

                <p className="text-gray-500 text-sm mt-1">
                  @{instagram || 'yourhandle'}
                </p>

              </div>

              <span className="text-green-400 text-sm">
                Connected
              </span>

            </div>

          </div>

        </section>

        {/* SAVE */}

        <div className="flex justify-end pb-10">

          <button
            onClick={saveSettings}
            className="bg-blue-600 hover:bg-blue-700 px-8 py-3 rounded-lg font-bold transition"
          >
            Save Settings
          </button>

        </div>

      </div>

    </main>
  )
}
