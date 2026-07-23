'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

import {
  getCart,
  removeFromCart,
  clearCart,
  getCartTotal,
  CartItem,
} from '@/lib/cart'

export default function CartDrawer({
  onClose,
}: {
  onClose?: () => void
}) {
  const [items, setItems] = useState<CartItem[]>([])

  function refreshCart() {
    setItems(getCart())
  }

  useEffect(() => {
    refreshCart()

    window.addEventListener("cartUpdated", refreshCart)

    return () => {
      window.removeEventListener("cartUpdated", refreshCart)
    }
  }, [])

  return (
    <div className="fixed right-0 top-0 h-full w-96 bg-zinc-900 border-l border-zinc-800 p-6 overflow-y-auto z-50">

      {/* HEADER */}

      <div className="flex justify-between items-center mb-6">

        <h2 className="text-2xl font-bold text-white">
          Shopping Cart
        </h2>

        <button
          onClick={onClose}
          className="text-gray-400 hover:text-white text-2xl"
        >
          ✕
        </button>

      </div>

      {/* EMPTY */}

      {items.length === 0 && (

        <div className="text-center mt-20">

          <p className="text-gray-400 mb-6">
            Your cart is empty.
          </p>

          <Link
            href="/marketplace"
            onClick={onClose}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg"
          >
            Continue Shopping
          </Link>

        </div>

      )}

      {/* PRODUCTS */}

      {items.map((item) => (

        <div
          key={item.id}
          className="border-b border-zinc-800 py-5"
        >

          {item.image_url && (

            <img
              src={item.image_url}
              className="w-full h-40 object-cover rounded-lg mb-3"
            />

          )}

          <h3 className="text-white font-bold">

            {item.name}

          </h3>

          <p className="text-blue-400 mt-1">

            ₦{Number(item.price).toLocaleString()}

          </p>

          <p className="text-gray-400">

            Quantity: {item.quantity}

          </p>

          <button
            onClick={() => {
              removeFromCart(item.id)
            }}
            className="mt-3 text-red-500 hover:text-red-400"
          >
            Remove
          </button>

        </div>

      ))}

      {/* FOOTER */}

      {items.length > 0 && (

        <div className="mt-8">

          <div className="flex justify-between text-xl font-bold text-white mb-6">

            <span>Total</span>

            <span>

              ₦{Number(getCartTotal()).toLocaleString()}

            </span>

          </div>

          <Link
            href="/checkout"
            onClick={onClose}
            className="block text-center w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg"
          >
            Proceed to Checkout
          </Link>

          <button
            onClick={() => {
              clearCart()
            }}
            className="w-full mt-3 bg-red-600 hover:bg-red-700 text-white py-3 rounded-lg"
          >
            Clear Cart
          </button>

        </div>

      )}

    </div>
  )
}