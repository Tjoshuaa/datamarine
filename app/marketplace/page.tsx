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
  brand: string
  description: string
  specifications: string
  hide_price: boolean
  featured: boolean
}

export default function MarketplacePage() {
  const [products, setProducts] = useState<Product[]>([])
  const [search, setSearch] = useState('')

  useEffect(() => {
    loadProducts()
  }, [])

  async function loadProducts() {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('active', true)
      .order('created_at', { ascending: false })

    if (error) {
      console.log(error)
    }

    setProducts(data || [])
  }

  const filtered = products.filter((product) =>
    product.name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <main className="min-h-screen bg-black text-white">

      {/* HEADER */}

      <div className="border-b border-slate-800 bg-slate-950">

        <div className="max-w-7xl mx-auto px-6 py-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">

          <div>
            <p className="text-sm uppercase tracking-widest text-blue-400">
              DATA MARINE
            </p>

            <h1 className="text-2xl font-bold mt-1">
              Marketplace
            </h1>
          </div>

          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 bg-white text-black px-5 py-3 rounded-lg font-semibold hover:bg-gray-200 transition"
          >
            ← Return to Homepage
          </Link>

        </div>

      </div>

      {/* MARKETPLACE HERO */}

      <section className="bg-zinc-900 py-14 border-b border-zinc-800">

        <div className="max-w-7xl mx-auto px-6">

          <h2 className="text-4xl md:text-5xl font-bold">
            DATA MARINE Marketplace
          </h2>

          <p className="mt-3 text-gray-400 text-lg">
            Boats • Engines • Marine Spare Parts • Generators • Accessories
          </p>

          {/* SEARCH */}

          <div className="mt-8">

            <input
              className="w-full p-4 rounded-xl bg-black text-white border border-zinc-700 outline-none focus:border-blue-500"
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

          </div>

        </div>

      </section>

      {/* PRODUCTS */}

      <section className="max-w-7xl mx-auto p-6 md:p-8">

        {filtered.length === 0 ? (

          <div className="text-center py-20">

            <div className="text-5xl mb-5">
              🔍
            </div>

            <h2 className="text-2xl font-bold">
              No products found
            </h2>

            <p className="text-gray-400 mt-2">
              Try searching for another product.
            </p>

          </div>

        ) : (

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">

            {filtered.map((product) => (

              <div
                key={product.id}
                className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden hover:border-blue-500 transition"
              >

                {/* PRODUCT IMAGE */}

                <div className="relative">

                  <img
                    src={
                      product.image_url ||
                      'https://placehold.co/600x400'
                    }
                    alt={product.name}
                    className="h-52 w-full object-cover"
                  />

                  {product.featured && (

                    <span className="absolute top-3 left-3 text-xs font-bold bg-yellow-500 text-black px-3 py-1 rounded-full">
                      Featured
                    </span>

                  )}

                </div>

                {/* PRODUCT DETAILS */}

                <div className="p-5">

                  <h2 className="font-bold text-lg">
                    {product.name}
                  </h2>

                  <p className="text-gray-400 text-sm mt-1">
                    {product.brand}
                  </p>

                  <p className="text-gray-500 text-sm mt-1">
                    {product.category}
                  </p>

                  <p className="mt-3 text-sm text-gray-300 line-clamp-3">
                    {product.description}
                  </p>

                  {/* PRICE */}

                  {product.hide_price || product.price === 0 ? (

                    <p className="mt-4 text-blue-400 font-bold">
                      Price: Request Quote
                    </p>

                  ) : (

                    <p className="mt-4 text-blue-400 text-xl font-bold">
                      ₦{Number(
                        product.price
                      ).toLocaleString()}
                    </p>

                  )}

                  {/* STOCK */}

                  <p className="text-sm text-gray-400 mt-2">
                    Stock: {product.stock}
                  </p>

                  {/* VIEW PRODUCT */}

                  <Link
                    href={`/marketplace/${product.id}`}
                    className="block mt-4 bg-blue-600 hover:bg-blue-700 py-3 rounded-lg text-center font-semibold transition"
                  >
                    View Product
                  </Link>

                  {/* ADD TO CART */}

                  {!product.hide_price &&
                    product.price > 0 && (

                    <button
                      onClick={() => {

                        addToCart({
                          id: product.id,
                          name: product.name,
                          price: product.price,
                          image_url: product.image_url,
                          quantity: 1
                        })

                        alert(
                          `${product.name} added to cart`
                        )

                      }}
                      className="mt-3 w-full bg-green-600 hover:bg-green-700 py-3 rounded-lg font-semibold transition"
                    >
                      Add To Cart
                    </button>

                  )}

                </div>

              </div>

            ))}

          </div>

        )}

      </section>

    </main>
  )
}
