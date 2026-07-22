'use client'

export default function Topbar() {
  return (
    <header className="h-16 bg-zinc-900 border-b border-zinc-800 flex items-center justify-between px-8">
      <h1 className="text-2xl font-bold text-white">
        DATA MARINE Dashboard
      </h1>

      <div className="text-gray-300">
        Administrator
      </div>
    </header>
  )
}