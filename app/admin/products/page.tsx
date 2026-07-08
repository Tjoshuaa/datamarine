'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import Link from 'next/link'

type Product = {
  id: number
  name: string
  price: number
  stock: number
  category: string
  image_url: string
  active: boolean
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([])

  useEffect(() => {
    loadProducts()
  }, [])

  async function loadProducts() {
    const { data } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false })

    setProducts(data || [])
  }

  async function deleteProduct(id: number) {
    await supabase.from('products').delete().eq('id', id)
    loadProducts()
  }

  async function toggleStock(id: number, stock: number) {
    await supabase
      .from('products')
      .update({ stock: stock + 1 })
      .eq('id', id)

    loadProducts()
  }

  return (
    <main className="min-h-screen bg-black text-white p-10">

      <div className="flex justify-between items-center mb-8">

        <h1 className="text-4xl font-bold">
          Products
        </h1>

        <Link
          href="/admin/products/new"
          className="bg-green-600 px-4 py-2 rounded"
        >
          + Add Product
        </Link>

      </div>

      <div className="grid md:grid-cols-3 gap-6">

        {products.map((product) => (

          <div
            key={product.id}
            className="bg-zinc-900 border border-zinc-800 rounded p-4"
          >

            <img
              src={product.image_url || 'https://placehold.co/600x400'}
              className="h-40 w-full object-cover rounded"
            />

            <h2 className="mt-3 font-bold text-lg">
              {product.name}
            </h2>

            <p className="text-gray-400">
              {product.category}
            </p>

            <p className="text-blue-400 font-bold mt-2">
              ₦{Number(product.price).toLocaleString()}
            </p>

            <p className="text-sm mt-1">
              Stock: {product.stock}
            </p>

            <p className="text-sm mt-1">
              Status: {product.active ? 'Active' : 'Inactive'}
            </p>

            {/* ACTIONS */}
            <div className="flex gap-2 mt-4">

              <button
                onClick={() => toggleStock(product.id, product.stock)}
                className="bg-blue-600 px-3 py-1 rounded text-sm"
              >
                + Stock
              </button>

              <button
                onClick={() => deleteProduct(product.id)}
                className="bg-red-600 px-3 py-1 rounded text-sm"
              >
                Delete
              </button>

            </div>

          </div>

        ))}

      </div>

    </main>
  )
}