'use client'

import { useEffect, useState } from 'react'
import {
  getCart,
  removeFromCart,
  clearCart,
  CartItem,
} from '@/lib/cart'

export default function CartDrawer({
  onClose,
}: {
  onClose?: () => void
}) {
  const [items, setItems] = useState<CartItem[]>([])

  useEffect(() => {
    setItems(getCart())
  }, [])

  function refresh() {
    setItems([...getCart()])
  }

  return (
    <div className="fixed right-0 top-0 w-96 h-full bg-zinc-900 border-l border-zinc-800 p-6 overflow-y-auto z-50">

      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">

        <h2 className="text-2xl font-bold text-white">
          Cart
        </h2>

        {/* CLOSE BUTTON */}
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-white text-xl"
        >
          ✕
        </button>

      </div>

      {/* EMPTY STATE */}
      {items.length === 0 && (
        <p className="text-gray-400">
          Cart is empty
        </p>
      )}

      {/* ITEMS */}
      {items.map((item) => (
        <div
          key={item.id}
          className="mb-4 border-b border-zinc-800 pb-4"
        >
          <p className="text-white font-bold">
            {item.name}
          </p>

          <p className="text-gray-400">
            ₦{item.price.toLocaleString()} × {item.quantity}
          </p>

          <button
            className="text-red-500 mt-2"
            onClick={() => {
              removeFromCart(item.id)
              refresh()
            }}
          >
            Remove
          </button>
        </div>
      ))}

      {/* CLEAR CART */}
      {items.length > 0 && (
        <button
          onClick={() => {
            clearCart()
            refresh()
          }}
          className="mt-6 w-full bg-red-600 text-white py-2 rounded"
        >
          Clear Cart
        </button>
      )}

    </div>
  )
}