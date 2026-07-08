'use client'

import { useEffect, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { isAdminAuthenticated } from '@/lib/auth'

import Sidebar from '@/components/admin/Sidebar'
import Topbar from '@/components/admin/Topbar'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()

  const [checking, setChecking] = useState(true)

  useEffect(() => {
    // Don't protect the login page
    if (pathname === '/admin/login') {
      setChecking(false)
      return
    }

    if (!isAdminAuthenticated()) {
      router.replace('/admin/login')
    }

    setChecking(false)
  }, [pathname, router])

  if (pathname === '/admin/login') {
    return <>{children}</>
  }

  if (checking) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        Checking authentication...
      </div>
    )
  }

  if (!isAdminAuthenticated()) {
    return null
  }

  return (
    <div className="flex min-h-screen bg-black text-white">
      <Sidebar />

      <div className="flex-1">
        <Topbar />

        <main className="p-8">
          {children}
        </main>
      </div>
    </div>
  )
}