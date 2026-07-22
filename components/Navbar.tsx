'use client'

export default function Navbar({
  onCartClick,
}: {
  onCartClick?: () => void
}) {
  return (
    <nav className="bg-black text-white p-4 flex justify-between">

      <h1 className="font-bold">
        DATA MARINE ⚓
      </h1>

      <button
        onClick={onCartClick}
        className="bg-blue-600 px-4 py-2 rounded"
      >
        Cart
      </button>

    </nav>
  )
}