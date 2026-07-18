'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { uploadProductImage } from '@/lib/storage'

export default function NewProductPage() {

  const router = useRouter()

  const [name, setName] = useState('')
  const [brand, setBrand] = useState('')
  const [category, setCategory] = useState('')
  const [description, setDescription] = useState('')
  const [specifications, setSpecifications] = useState('')
  const [stock, setStock] = useState('')

  const [featured, setFeatured] = useState(false)

  const [image, setImage] = useState<File | null>(null)
  const [preview, setPreview] = useState('')

  const [loading, setLoading] = useState(false)


  function handleImage(e: React.ChangeEvent<HTMLInputElement>) {

    const file = e.target.files?.[0]

    if (!file) return

    setImage(file)
    setPreview(URL.createObjectURL(file))

  }


  async function createProduct() {

    try {

      setLoading(true)

      let imageUrl = ''


      if (image) {

        imageUrl = await uploadProductImage(image)

      }


      const product = {

        name,

        brand,

        category,

        description,

        specifications,

        stock: Number(stock),

        price: 0,

        hide_price: true,

        featured,

        image_url: imageUrl,

        active: true

      }


      console.log("Sending product:", product)


      const { data, error } = await supabase
        .from('products')
        .insert(product)
        .select()


      if (error) {

        console.log(error)

        alert(
          "SUPABASE ERROR:\n\n" +
          error.message
        )

        return

      }


      console.log(data)


      alert("Product created successfully")


      router.push('/admin/products')


    }

    catch(error:any) {


      console.log(error)


      alert(
        "SYSTEM ERROR:\n\n" +
        error.message
      )


    }


    finally {

      setLoading(false)

    }

  }



  return (

    <main className="min-h-screen bg-black text-white p-10">


      <h1 className="text-4xl font-bold mb-8">
        Add Product
      </h1>


      <div className="max-w-xl space-y-4">


        <input
          className="w-full p-3 bg-zinc-900 border rounded"
          placeholder="Product Name"
          value={name}
          onChange={e=>setName(e.target.value)}
        />


        <input
          className="w-full p-3 bg-zinc-900 border rounded"
          placeholder="Brand"
          value={brand}
          onChange={e=>setBrand(e.target.value)}
        />


        <input
          className="w-full p-3 bg-zinc-900 border rounded"
          placeholder="Category"
          value={category}
          onChange={e=>setCategory(e.target.value)}
        />


        <textarea
          className="w-full p-3 bg-zinc-900 border rounded"
          placeholder="Description"
          value={description}
          onChange={e=>setDescription(e.target.value)}
        />


        <textarea
          className="w-full p-3 bg-zinc-900 border rounded"
          placeholder="Specifications / Compatible Models"
          value={specifications}
          onChange={e=>setSpecifications(e.target.value)}
        />


        <input
          className="w-full p-3 bg-zinc-900 border rounded"
          placeholder="Stock"
          type="number"
          value={stock}
          onChange={e=>setStock(e.target.value)}
        />


        <input
          type="file"
          accept="image/*"
          onChange={handleImage}
        />


        {preview && (

          <img
            src={preview}
            alt="preview"
            className="w-40 h-40 object-cover rounded"
          />

        )}



        <label className="flex gap-2 items-center">

          <input
            type="checkbox"
            checked={featured}
            onChange={e=>setFeatured(e.target.checked)}
          />

          Featured Product

        </label>



        <button

          onClick={createProduct}

          disabled={loading}

          className="w-full bg-green-600 py-3 rounded font-bold"

        >

          {loading ? "Creating..." : "Create Product"}

        </button>


      </div>


    </main>

  )

}