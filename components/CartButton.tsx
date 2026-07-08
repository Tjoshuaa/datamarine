'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { getCart } from '@/lib/cart'

export default function CartButton() {
  const [count, setCount] = useState(0)

  useEffect(() => {
    const update = () => {
      const cart = getCart()
      const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0)
      setCount(totalItems)
    }

    update()
    const interval = setInterval(update, 500)

    return () => clearInterval(interval)
  }, [])

  return (
    <Link href="/cart" className="relative">
      🛒 Cart ({count})
    </Link>
  )
}