'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { addToCart } from '@/lib/cart'

type Product = {
  id: number
  name: string
  price: number
  image_url: string
  category: string
  stock: number
}

export default function MarketplacePage() {
  const [products, setProducts] = useState<Product[]>([])
  const [search, setSearch] = useState('')

  useEffect(() => {
    loadProducts()
  }, [])

  async function loadProducts() {
    const { data } = await supabase
      .from('products')
      .select('*')
      .eq('active', true)
      .order('created_at', { ascending: false })

    setProducts(data || [])
  }

  const filtered = products.filter((product) =>
    product.name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <main className="min-h-screen bg-black text-white">

      {/* HERO */}
      <section className="bg-zinc-900 py-16 border-b border-zinc-800">
        <div className="max-w-7xl mx-auto px-6">

          <h1 className="text-5xl font-bold">
            Datamarine Marketplace
          </h1>

          <p className="mt-3 text-gray-400">
            Boats • Engines • Accessories • Marine Equipment
          </p>

          <input
            className="mt-8 w-full p-4 rounded bg-black border border-zinc-700 text-white"
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

        </div>
      </section>

      {/* PRODUCTS */}
      <section className="max-w-7xl mx-auto p-8">

        <div className="grid md:grid-cols-4 gap-6">

          {filtered.map((product) => (

            <div
              key={product.id}
              className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden hover:scale-[1.02] transition"
            >

              {/* IMAGE */}
              <img
                src={
                  product.image_url ||
                  'https://placehold.co/600x400'
                }
                className="h-52 w-full object-cover"
              />

              {/* CONTENT */}
              <div className="p-5">

                <h2 className="font-bold text-lg">
                  {product.name}
                </h2>

                <p className="text-gray-400 text-sm mt-1">
                  {product.category}
                </p>

                <p className="mt-3 text-blue-400 text-xl font-bold">
                  ₦{Number(product.price).toLocaleString()}
                </p>

                <p className="text-sm text-gray-400 mt-1">
                  Stock: {product.stock}
                </p>

                {/* VIEW BUTTON */}
                <Link
                  href={`/marketplace/${product.id}`}
                  className="block mt-4 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded text-center"
                >
                  View Product
                </Link>

                {/* ADD TO CART BUTTON */}
                <button
                  onClick={() =>
                    addToCart({
                      id: product.id,
                      name: product.name,
                      price: product.price,
                      image_url: product.image_url,
                      quantity: 1,
                    })
                  }
                  className="mt-3 w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded"
                >
                  Add to Cart
                </button>

              </div>

            </div>

          ))}

        </div>

      </section>

    </main>
  )
}