import Link from 'next/link'

export default function Dashboard() {
  const cards = [
    {
      title: 'Products',
      href: '/admin/products',
      emoji: '📦',
    },
    {
      title: 'Orders',
      href: '/admin/orders',
      emoji: '🛒',
    },
    {
      title: 'Analytics',
      href: '/admin/analytics',
      emoji: '📊',
    },
    {
      title: 'Customers',
      href: '/admin/customers',
      emoji: '👥',
    },
  ]

  return (
    <main>

      <h1 className="text-5xl font-bold text-white mb-10">
        Welcome Back 👋
      </h1>

      <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-6">

        {cards.map(card => (

          <Link
            key={card.href}
            href={card.href}
            className="bg-zinc-900 border border-zinc-800 rounded-xl p-8 hover:border-blue-500 transition"
          >

            <div className="text-5xl">
              {card.emoji}
            </div>

            <h2 className="text-2xl font-bold text-white mt-5">
              {card.title}
            </h2>

          </Link>

        ))}

      </div>

    </main>
  )
}