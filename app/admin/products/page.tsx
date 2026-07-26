'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

type Product = {
  id: number
  name: string
  brand: string
  category: string
  stock: number
  price: number
  image_url: string
  featured: boolean
  active: boolean
  hide_price: boolean
}


export default function ProductsPage() {

  const router = useRouter()

  const [products, setProducts] = useState<Product[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)


  useEffect(() => {

    loadProducts()

  }, [])



  async function loadProducts() {

    setLoading(true)

    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', {
        ascending:false
      })


    if(error){

      console.log(error)

    }


    setProducts(data || [])

    setLoading(false)

  }




  async function deleteProduct(id:number){

    const confirmDelete = confirm(
      "Delete this product?"
    )


    if(!confirmDelete) return


    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id)


    if(error){

      alert(error.message)

      return

    }


    alert("Product deleted")


    loadProducts()

  }





  const filteredProducts = products.filter(product =>

    product.name
    .toLowerCase()
    .includes(
      search.toLowerCase()
    )

  )




  return (

    <main className="min-h-screen bg-black text-white p-10">


      <div className="flex justify-between items-center mb-10">


        <h1 className="text-4xl font-bold">
          Product Management
        </h1>



        <Link

          href="/admin/products/new"

          className="bg-green-600 hover:bg-green-700 px-6 py-3 rounded-lg font-bold"

        >

          + Add Product

        </Link>


      </div>




      <input

        className="w-full mb-8 p-4 bg-zinc-900 border border-zinc-700 rounded"

        placeholder="Search products..."

        value={search}

        onChange={
          e=>setSearch(e.target.value)
        }

      />




      {loading && (

        <p>
          Loading products...
        </p>

      )}






      <div className="overflow-x-auto">


        <table className="w-full border border-zinc-800">


          <thead className="bg-zinc-900">

            <tr>

              <th className="p-4 text-left">
                Image
              </th>

              <th className="p-4 text-left">
                Product
              </th>

              <th className="p-4 text-left">
                Category
              </th>

              <th className="p-4 text-left">
                Stock
              </th>

              <th className="p-4 text-left">
                Price
              </th>

              <th className="p-4 text-left">
                Actions
              </th>


            </tr>


          </thead>





          <tbody>


          {filteredProducts.map(product => (


            <tr
              key={product.id}
              className="border-t border-zinc-800"
            >


              <td className="p-4">

                <img

                  src={
                    product.image_url ||
                    "https://placehold.co/80"
                  }

                  className="w-16 h-16 object-cover rounded"

                  alt={product.name}

                />

              </td>





              <td className="p-4">


                <p className="font-bold">

                  {product.name}

                </p>


                <p className="text-gray-400 text-sm">

                  {product.brand}

                </p>


              </td>





              <td className="p-4">

                {product.category}

              </td>





              <td className="p-4">

                {product.stock}

              </td>





              <td className="p-4">

                {product.hide_price

                ?

                "Request Quote"

                :

                `NGN ${Number(product.price).toLocaleString()}`

                }

              </td>





              <td className="p-4 space-x-2">


                <button

                  onClick={() =>
                    router.push(
                      `/admin/products/edit/${product.id}`
                    )
                  }

                  className="bg-blue-600 px-4 py-2 rounded"

                >

                  Edit

                </button>




                <button

                  onClick={() =>
                    deleteProduct(product.id)
                  }

                  className="bg-red-600 px-4 py-2 rounded"

                >

                  Delete

                </button>


              </td>




            </tr>


          ))}


          </tbody>


        </table>


      </div>


    </main>

  )

}