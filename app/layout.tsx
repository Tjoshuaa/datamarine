'use client'

import './globals.css'

import { useState } from 'react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import CartDrawer from '@/components/CartDrawer'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [cartOpen, setCartOpen] = useState(false)

  return (
    <html lang="en">
      <body>

        {/* NAVBAR (we pass toggle later) */}
        <Navbar onCartClick={() => setCartOpen(true)} />

        {children}

        <Footer />

        {/* CART DRAWER */}
        {cartOpen && (
          <CartDrawer onClose={() => setCartOpen(false)} />
        )}

      </body>
    </html>
  )
}