'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { getCart, clearCart, CartItem } from '@/lib/cart'
import { supabase } from '@/lib/supabase'

export default function CheckoutPage() {
  const router = useRouter()
  const [items, setItems] = useState<CartItem[]>([])

  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')

  useEffect(() => {
    setItems(getCart())
  }, [])

  const total = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  )

  async function placeOrder() {
    if (!name || !phone) {
      alert('Please fill required fields')
      return
    }

    const { error } = await supabase.from('orders').insert({
      customer_name: name,
      customer_phone: phone,
      customer_email: email,
      total_price: total,
      status: 'pending',
      payment_status: 'unpaid',
      tracking_id: `DM-${Date.now()}`,
    })

    if (error) {
      alert(error.message)
      return
    }

    clearCart()
    router.push('/order-success')
  }

  return (
    <main className="min-h-screen bg-black text-white p-10">

      <h1 className="text-4xl font-bold mb-8">
        Checkout
      </h1>

      {/* CART SUMMARY */}
      <div className="mb-10 bg-zinc-900 p-6 rounded border border-zinc-800">

        <h2 className="text-2xl mb-4">Order Summary</h2>

        {items.map((item) => (
          <div key={item.id} className="flex justify-between mb-2">

            <p>
              {item.name} × {item.quantity}
            </p>

            <p>
              ₦{(item.price * item.quantity).toLocaleString()}
            </p>

          </div>
        ))}

        <hr className="my-4 border-zinc-700" />

        <p className="text-xl font-bold">
          Total: ₦{total.toLocaleString()}
        </p>

      </div>

      {/* CUSTOMER FORM */}
      <div className="space-y-4 max-w-md">

        <input
          className="w-full p-3 bg-zinc-900 border border-zinc-700 rounded"
          placeholder="Full Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <input
          className="w-full p-3 bg-zinc-900 border border-zinc-700 rounded"
          placeholder="Phone Number"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />

        <input
          className="w-full p-3 bg-zinc-900 border border-zinc-700 rounded"
          placeholder="Email (optional)"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <button
          onClick={placeOrder}
          className="w-full bg-green-600 hover:bg-green-700 py-3 rounded font-bold"
        >
          Place Order
        </button>

      </div>

    </main>
  )
}