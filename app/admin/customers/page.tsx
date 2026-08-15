'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

type Customer = {
  id: number
  name: string
  email: string
  phone: string
  created_at: string
}

export default function CustomersPage() {

  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)


  useEffect(() => {
    loadCustomers()
  }, [])


  async function loadCustomers() {

    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .order('created_at', {
        ascending: false
      })


    if (error) {

      console.log(error)

    }


    setCustomers(data || [])

    setLoading(false)

  }



  return (

    <main className="text-white">


      <h1 className="text-4xl font-bold mb-8">
        Customers
      </h1>



      {loading && (

        <p className="text-gray-400">
          Loading customers...
        </p>

      )}



      {!loading && customers.length === 0 && (

        <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-xl">

          <p className="text-gray-400">
            No customers yet.
          </p>

        </div>

      )}



      {customers.length > 0 && (

        <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">


          <table className="w-full">


            <thead className="bg-zinc-800">

              <tr>

                <th className="p-4 text-left">
                  Name
                </th>

                <th className="p-4 text-left">
                  Email
                </th>

                <th className="p-4 text-left">
                  Phone
                </th>

                <th className="p-4 text-left">
                  Joined
                </th>

              </tr>

            </thead>



            <tbody>


              {customers.map(customer => (

                <tr
                  key={customer.id}
                  className="border-t border-zinc-800"
                >

                  <td className="p-4">
                    {customer.name}
                  </td>


                  <td className="p-4 text-gray-300">
                    {customer.email}
                  </td>


                  <td className="p-4 text-gray-300">
                    {customer.phone}
                  </td>


                  <td className="p-4 text-gray-400">

                    {new Date(
                      customer.created_at
                    ).toLocaleDateString()}

                  </td>


                </tr>


              ))}


            </tbody>


          </table>


        </div>

      )}



    </main>

  )

}