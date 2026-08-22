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
    if (!name || !phone) {
      alert('Please fill in your name and phone number.')
      return
    }

    if (items.length === 0) {
      alert('Your cart is empty.')
      return
    }

    setPlacingOrder(true)

    try {
      /*
       * STEP 1
       * Save the order to Supabase
       */

      const trackingId = `DM-${Date.now()}`

      const { data: order, error } = await supabase
        .from('orders')
        .insert({
          customer_name: name,
          customer_phone: phone,
          customer_email: email,
          total_price: total,
          status: 'pending',
          payment_status: 'unpaid',
          tracking_id: trackingId,
        })
        .select()
        .single()

      if (error) {
        console.error('Order creation error:', error)

        alert(`Could not place order: ${error.message}`)

        setPlacingOrder(false)

        return
      }

      /*
       * STEP 2
       * Send email notification
       */

      try {
        const notificationResponse = await fetch(
          '/api/order-notification',
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              customer_name: name,
              customer_phone: phone,
              customer_email: email,
              total_price: total,
              tracking_id: trackingId,
              order_id: order.id,
            }),
          }
        )

        if (!notificationResponse.ok) {
          console.error(
            'Order notification failed:',
            await notificationResponse.text()
          )
        }
      } catch (notificationError) {
        console.error(
          'Notification error:',
          notificationError
        )
      }

      /*
       * STEP 3
       * Clear cart
       */

      clearCart()

      /*
       * STEP 4
       * Send customer to success page
       */

      router.push('/order-success')

    } catch (error) {

      console.error('Unexpected checkout error:', error)

      alert(
        'Something went wrong while placing your order.'
      )

    } finally {

      setPlacingOrder(false)

    }
  }

  return (
    <main className="min-h-screen bg-black text-white p-6 md:p-10">

      <div className="max-w-4xl mx-auto">

        <h1 className="text-4xl md:text-5xl font-bold mb-8">
          Checkout
        </h1>

        {/* ORDER SUMMARY */}

        <div className="mb-10 bg-zinc-900 border border-zinc-800 p-6 rounded-2xl">

          <h2 className="text-2xl font-bold mb-5">
            Order Summary
          </h2>

          {items.length === 0 ? (

            <p className="text-gray-400">
              Your cart is empty.
            </p>

          ) : (

            <div className="space-y-3">

              {items.map((item) => (

                <div
                  key={item.id}
                  className="flex justify-between gap-4"
                >

                  <p>
                    {item.name} × {item.quantity}
                  </p>

                  <p className="font-semibold">
                    ₦{(
                      item.price * item.quantity
                    ).toLocaleString()}
                  </p>

                </div>

              ))}

            </div>

          )}

          <hr className="my-5 border-zinc-700" />

          <div className="flex justify-between text-xl">

            <p className="font-bold">
              Total
            </p>

            <p className="font-bold text-blue-400">
              ₦{total.toLocaleString()}
            </p>

          </div>

        </div>

        {/* CUSTOMER DETAILS */}

        <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl">

          <h2 className="text-2xl font-bold mb-5">
            Customer Details
          </h2>

          <div className="space-y-4 max-w-xl">

            <div>

              <label className="block mb-2 text-sm font-semibold">
                Full Name
              </label>

              <input
                className="w-full p-3 bg-black border border-zinc-700 rounded-lg outline-none focus:border-blue-500"
                placeholder="Your full name"
                value={name}
                onChange={(e) =>
                  setName(e.target.value)
                }
              />

            </div>

            <div>

              <label className="block mb-2 text-sm font-semibold">
                Phone Number
              </label>

              <input
                className="w-full p-3 bg-black border border-zinc-700 rounded-lg outline-none focus:border-blue-500"
                placeholder="08012345678"
                value={phone}
                onChange={(e) =>
                  setPhone(e.target.value)
                }
              />

            </div>

            <div>

              <label className="block mb-2 text-sm font-semibold">
                Email
              </label>

              <input
                type="email"
                className="w-full p-3 bg-black border border-zinc-700 rounded-lg outline-none focus:border-blue-500"
                placeholder="your@email.com"
                value={email}
                onChange={(e) =>
                  setEmail(e.target.value)
                }
              />

            </div>

            <button
              onClick={placeOrder}
              disabled={placingOrder || items.length === 0}
              className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-700 disabled:cursor-not-allowed py-4 rounded-lg font-bold transition"
            >

              {placingOrder
                ? 'Placing Order...'
                : 'Place Order'}

            </button>

          </div>

        </div>

      </div>

    </main>
  )
}
