'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function EditProductPage(){

  const params = useParams()
  const router = useRouter()

  const id = params.id


  const [loading,setLoading] = useState(true)

  const [name,setName] = useState('')
  const [brand,setBrand] = useState('')
  const [category,setCategory] = useState('')
  const [description,setDescription] = useState('')
  const [specifications,setSpecifications] = useState('')
  const [stock,setStock] = useState('')
  const [price,setPrice] = useState('')
  const [featured,setFeatured] = useState(false)
  const [hidePrice,setHidePrice] = useState(false)



  useEffect(()=>{

    loadProduct()

  },[])



  async function loadProduct(){

    const {data,error}=await supabase
      .from('products')
      .select('*')
      .eq('id',id)
      .single()


    if(error){

      alert(error.message)
      return

    }


    setName(data.name)
    setBrand(data.brand)
    setCategory(data.category)
    setDescription(data.description)
    setSpecifications(data.specifications)
    setStock(String(data.stock))
    setPrice(String(data.price))
    setFeatured(data.featured)
    setHidePrice(data.hide_price)

    setLoading(false)

  }




  async function updateProduct(){

    const {error}=await supabase
      .from('products')
      .update({

        name,
        brand,
        category,
        description,
        specifications,
        stock:Number(stock),
        price:Number(price),
        featured,
        hide_price:hidePrice

      })
      .eq('id',id)



    if(error){

      alert(error.message)
      return

    }


    alert("Product updated successfully")

    router.push('/admin/products')

  }




  if(loading){

    return (

      <main className="bg-black min-h-screen text-white p-10">

        Loading product...

      </main>

    )

  }




  return (

    <main className="bg-black min-h-screen text-white p-10">


      <h1 className="text-4xl font-bold mb-8">
        Edit Product
      </h1>



      <div className="max-w-xl space-y-4">



        <input
          className="w-full p-3 bg-zinc-900 rounded"
          value={name}
          onChange={e=>setName(e.target.value)}
          placeholder="Name"
        />



        <input
          className="w-full p-3 bg-zinc-900 rounded"
          value={brand}
          onChange={e=>setBrand(e.target.value)}
          placeholder="Brand"
        />



        <input
          className="w-full p-3 bg-zinc-900 rounded"
          value={category}
          onChange={e=>setCategory(e.target.value)}
          placeholder="Category"
        />



        <textarea
          className="w-full p-3 bg-zinc-900 rounded"
          value={description}
          onChange={e=>setDescription(e.target.value)}
          placeholder="Description"
        />



        <textarea
          className="w-full p-3 bg-zinc-900 rounded"
          value={specifications}
          onChange={e=>setSpecifications(e.target.value)}
          placeholder="Specifications"
        />



        <input
          className="w-full p-3 bg-zinc-900 rounded"
          value={stock}
          onChange={e=>setStock(e.target.value)}
          placeholder="Stock"
          type="number"
        />



        <input
          className="w-full p-3 bg-zinc-900 rounded"
          value={price}
          onChange={e=>setPrice(e.target.value)}
          placeholder="Price"
          type="number"
        />



        <label className="flex gap-2">

          <input
            type="checkbox"
            checked={featured}
            onChange={e=>setFeatured(e.target.checked)}
          />

          Featured

        </label>




        <label className="flex gap-2">

          <input
            type="checkbox"
            checked={hidePrice}
            onChange={e=>setHidePrice(e.target.checked)}
          />

          Hide Price / Request Quote

        </label>




        <button

          onClick={updateProduct}

          className="w-full bg-blue-600 py-3 rounded font-bold"

        >

          Save Changes

        </button>



      </div>


    </main>

  )

}