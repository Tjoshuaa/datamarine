'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const links = [
  {
    name: 'Dashboard',
    href: '/admin',
    icon: '🏠',
  },
  {
    name: 'Products',
    href: '/admin/products',
    icon: '📦',
  },
  {
    name: 'Orders',
    href: '/admin/orders',
    icon: '🛒',
  },
  {
    name: 'Boat Builds',
    href: '/admin/boat-builds',
    icon: '🚤',
  },
  {
    name: "Boats We've Built",
    href: '/admin/boats-built',
    icon: '🛥️',
  },
  {
    name: 'Customers',
    href: '/admin/customers',
    icon: '👥',
  },
  {
    name: 'Analytics',
    href: '/admin/analytics',
    icon: '📊',
  },
  {
    name: 'Quotes',
    href: '/admin/quotes',
    icon: '💬',
  },
  {
    name: 'Settings',
    href: '/admin/settings',
    icon: '⚙️',
  },
]

export default function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-64 min-h-screen bg-slate-950 border-r border-slate-800 text-white p-5 flex flex-col">

      {/* BRAND */}

      <div className="mb-8 px-2">

        <div className="flex items-center gap-3">

          <div className="w-11 h-11 rounded-xl bg-blue-600 flex items-center justify-center text-2xl shadow-lg shadow-blue-600/20">
            ⚓
          </div>

          <div>
            <h2 className="text-lg font-bold tracking-tight">
              DATA MARINE
            </h2>

            <p className="text-xs text-slate-500 uppercase tracking-widest">
              Admin Panel
            </p>
          </div>

        </div>

      </div>

      {/* NAVIGATION */}

      <div className="mb-3 px-2">

        <p className="text-[11px] uppercase tracking-[0.2em] text-slate-600 font-semibold">
          Management
        </p>

      </div>

      <nav className="space-y-1.5">

        {links.map((link) => {

          const isActive =
            link.href === '/admin'
              ? pathname === '/admin'
              : pathname === link.href ||
                pathname.startsWith(`${link.href}/`)

          return (
            <Link
              key={link.href}
              href={link.href}
              className={`
                group flex items-center gap-3 rounded-xl px-3 py-3
                font-medium transition-all duration-200
                ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                    : 'text-slate-400 hover:bg-slate-900 hover:text-white'
                }
              `}
            >

              <span
                className={`
                  w-9 h-9 rounded-lg flex items-center justify-center
                  text-lg transition
                  ${
                    isActive
                      ? 'bg-white/10'
                      : 'bg-slate-900 group-hover:bg-slate-800'
                  }
                `}
              >
                {link.icon}
              </span>

              <span className="flex-1">
                {link.name}
              </span>

              {isActive && (
                <span className="text-white text-sm">
                  →
                </span>
              )}

            </Link>
          )
        })}

      </nav>

      {/* QUICK LINK */}

      <div className="mt-auto pt-8">

        <div className="border-t border-slate-800 pt-5">

          <Link
            href="/"
            className="flex items-center gap-3 rounded-xl px-3 py-3 text-slate-400 hover:bg-slate-900 hover:text-white transition"
          >

            <span className="w-9 h-9 rounded-lg bg-slate-900 flex items-center justify-center">
              🌐
            </span>

            <div>
              <p className="text-sm font-medium">
                View Website
              </p>

              <p className="text-xs text-slate-600">
                Open DATA MARINE
              </p>
            </div>

          </Link>

        </div>

      </div>

    </aside>
  )
}
