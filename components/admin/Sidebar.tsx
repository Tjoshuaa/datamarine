'use client'

import Link from 'next/link'

const links = [
  { name: 'Dashboard', href: '/admin' },
  { name: 'Products', href: '/admin/products' },
  { name: 'Orders', href: '/admin/orders' },
  { name: 'Analytics', href: '/admin/analytics' },
  { name: 'Customers', href: '/admin/customers' },
  { name: 'Settings', href: '/admin/settings' },
]

export default function Sidebar() {
  return (
    <aside className="w-64 min-h-screen bg-slate-900 text-white p-6">
      <h2 className="text-2xl font-bold mb-8">
        DATA MARINE Admin
      </h2>

      <nav className="space-y-3">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="block rounded-lg px-4 py-3 hover:bg-slate-700 transition"
          >
            {link.name}
          </Link>
        ))}
      </nav>
    </aside>
  )
}