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
  const [placingOrder, setPlacingOrder] = useState(false)

  useEffect(() => {
    setItems(getCart())
  }, [])

  const total = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  )

  async function placeOrder() {
    if (!name.trim() || !phone.trim()) {
      alert('Please fill in your name and phone number')
      return
    }

    if (items.length === 0) {
      alert('Your cart is empty')
      return
    }

    setPlacingOrder(true)

    try {
      // 1. Save customer
      const { error: customerError } = await supabase
        .from('customers')
        .insert({
          name: name.trim(),
          phone: phone.trim(),
          email: email.trim() || null,
        })

      if (customerError) {
        console.error('Customer error:', customerError)
        alert(`Could not save customer: ${customerError.message}`)
        return
      }

      // 2. Save order
      const { error: orderError } = await supabase
        .from('orders')
        .insert({
          customer_name: name.trim(),
          customer_phone: phone.trim(),
          customer_email: email.trim() || null,
          total_price: total,
          status: 'pending',
          payment_status: 'unpaid',
          tracking_id: `DM-${Date.now()}`,
        })

      if (orderError) {
        console.error('Order error:', orderError)
        alert(`Could not place order: ${orderError.message}`)
        return
      }

      // 3. Clear cart
      clearCart()

      // 4. Send customer to success page
      router.push('/order-success')

    } catch (error) {
      console.error('Unexpected checkout error:', error)
      alert('Something went wrong while placing your order.')
    } finally {
      setPlacingOrder(false)
    }
  }

  return (
    <main className="min-h-screen bg-black text-white p-10">

      <h1 className="text-4xl font-bold mb-8">
        Checkout
      </h1>

      {/* CART SUMMARY */}
      <div className="mb-10 bg-zinc-900 p-6 rounded border border-zinc-800">

        <h2 className="text-2xl mb-4">
          Order Summary
        </h2>

        {items.map((item) => (
          <div
            key={item.id}
            className="flex justify-between mb-2"
          >
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
          disabled={placingOrder}
          className="w-full bg-green-600 hover:bg-green-700 py-3 rounded font-bold disabled:opacity-50"
        >
          {placingOrder ? 'Placing Order...' : 'Place Order'}
        </button>

      </div>

    </main>
  )
}
