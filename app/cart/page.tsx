'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  getCart,
  removeFromCart,
  updateQuantity,
  clearCart,
  getCartTotal
} from '@/lib/cart'

type CartItem = {
  id: number
  name: string
  price: number
  image_url?: string | null
  quantity: number
}

export default function CartPage() {
  const [cart, setCart] = useState<CartItem[]>([])

  useEffect(() => {
    setCart(getCart())
  }, [])

  function refresh() {
    setCart([...getCart()])
  }

  function handleRemove(id: number) {
    removeFromCart(id)
    refresh()
  }

  function handleQty(id: number, qty: number) {
    if (qty <= 0) return
    updateQuantity(id, qty)
    refresh()
  }

  function handleClear() {
    clearCart()
    refresh()
  }

  const total = getCartTotal()

  return (
    <main className="max-w-6xl mx-auto p-10">

      <h1 className="text-4xl font-bold mb-10">
        Your Cart
      </h1>

      {cart.length === 0 ? (
        <div>
          <p className="text-lg">Your cart is empty.</p>
          <Link href="/marketplace" className="text-blue-600 mt-4 block">
            Go shopping →
          </Link>
        </div>
      ) : (
        <>
          <div className="space-y-6">

            {cart.map(item => (
              <div
                key={item.id}
                className="flex items-center justify-between bg-white p-5 rounded shadow"
              >

                <div>
                  <h2 className="font-bold text-xl">
                    {item.name}
                  </h2>

                  <p className="text-gray-600">
                    ₦{Number(item.price).toLocaleString()}
                  </p>
                </div>

                <div className="flex items-center gap-3">

                  <button
                    onClick={() => handleQty(item.id, item.quantity - 1)}
                    className="px-3 py-1 bg-gray-200"
                  >
                    -
                  </button>

                  <span>{item.quantity}</span>

                  <button
                    onClick={() => handleQty(item.id, item.quantity + 1)}
                    className="px-3 py-1 bg-gray-200"
                  >
                    +
                  </button>

                </div>

                <button
                  onClick={() => handleRemove(item.id)}
                  className="text-red-600"
                >
                  Remove
                </button>

              </div>
            ))}

          </div>

          <div className="mt-10 p-6 bg-slate-900 text-white rounded">

            <h2 className="text-2xl font-bold">
              Total: ₦{total.toLocaleString()}
            </h2>

            <div className="flex gap-4 mt-5">

              <button
                onClick={handleClear}
                className="bg-red-600 px-6 py-3 rounded"
              >
                Clear Cart
              </button>

              <button className="bg-green-600 px-6 py-3 rounded">
                Checkout
              </button>

            </div>

          </div>
        </>
      )}

    </main>
  )
}