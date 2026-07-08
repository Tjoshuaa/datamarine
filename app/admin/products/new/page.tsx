'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { uploadProductImage } from '@/lib/storage'
export default function NewProductPage() {
  const router = useRouter()

  const [name, setName] = useState('')
  const [price, setPrice] = useState('')
  const [category, setCategory] = useState('')
  const [stock, setStock] = useState('')
  const [imageUrl, setImageUrl] = useState('')
const [image, setImage] = useState<File | null>(null)
  async function createProduct() {
  let uploadedImageUrl = ''

  if (image) {
    uploadedImageUrl = await uploadProductImage(image)
  }

  const { error } = await supabase.from('products').insert({
    name,
    price: Number(price),
    category,
    stock: Number(stock),
    image_url: uploadedImageUrl,
    active: true,
  })

  if (error) {
    alert(error.message)
    return
  }

  router.push('/admin/products')
}

  return (
    <main className="min-h-screen bg-black text-white p-10">

      <h1 className="text-4xl font-bold mb-8">
        Add Product (Admin)
      </h1>

      <div className="space-y-4 max-w-xl">

        <input
          className="w-full p-3 bg-zinc-900 border border-zinc-700 rounded"
          placeholder="Product Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <input
          className="w-full p-3 bg-zinc-900 border border-zinc-700 rounded"
          placeholder="Price"
          type="number"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
        />

        

        <input
          className="w-full p-3 bg-zinc-900 border border-zinc-700 rounded"
          placeholder="Stock"
          type="number"
          value={stock}
          onChange={(e) => setStock(e.target.value)}
        />
<input
  type="file"
  accept="image/*"
  className="w-full p-3 bg-zinc-900 border border-zinc-700 rounded"
  onChange={(e) =>
    setImage(e.target.files?.[0] || null)
  }
/>
        <input
          className="w-full p-3 bg-zinc-900 border border-zinc-700 rounded"
          placeholder="Image URL"
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
        />

        <button
          onClick={createProduct}
          className="w-full bg-green-600 hover:bg-green-700 py-3 rounded"
        >
          Create Product
        </button>

      </div>

    </main>
  )
}