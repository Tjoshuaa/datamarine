'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

type Product = {
  id: number
  name: string
  price: number
  image_url: string | null
}

export default function FeaturedProducts() {
  const [products, setProducts] = useState<Product[]>([])

  useEffect(() => {
    loadProducts()
  }, [])

  async function loadProducts() {
    const { data } = await supabase
      .from('products')
      .select('id,name,price,image_url')
      .eq('active', true)
      .limit(4)

    setProducts(data || [])
  }

  return (
    <section className="max-w-7xl mx-auto py-20 px-6">

      <div className="flex justify-between items-center mb-10">

        <h2 className="text-4xl font-bold">
          Featured Products
        </h2>

        <Link
          href="/marketplace"
          className="text-blue-600 font-semibold"
        >
          View All →
        </Link>

      </div>

      <div className="grid md:grid-cols-4 gap-8">

        {products.map(product => (

          <div
            key={product.id}
            className="bg-white rounded-xl shadow hover:shadow-xl transition"
          >

            <img
              src={
                product.image_url ||
                "https://placehold.co/600x400?text=DATA MARINE"
              }
              className="w-full h-56 object-cover rounded-t-xl"
              alt={product.name}
            />

            <div className="p-5">

              <h3 className="font-bold text-xl">
                {product.name}
              </h3>

              <p className="text-blue-700 text-2xl font-bold mt-3">
                ₦{Number(product.price).toLocaleString()}
              </p>

              <Link
                href={`/marketplace/${product.id}`}
                className="block mt-5 bg-blue-600 text-white py-3 rounded text-center"
              >
                View Product
              </Link>

            </div>

          </div>

        ))}

      </div>

    </section>
  )
}