'use client'

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

import { supabase } from "@/lib/supabase";
import { addToCart } from "@/lib/cart";

export default function ProductPage() {

  const router = useRouter();
  const params = useParams();

  const [product, setProduct] = useState<any>(null);

  useEffect(() => {
    loadProduct();
  }, []);

  async function loadProduct() {

    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("id", params.id)
      .single();

    if (error) {
      console.log(error);
    }

    setProduct(data);
  }


  if (!product) {

    return (
      <div className="min-h-screen bg-black p-10 text-white">
        Loading...
      </div>
    );

  }


  return (

    <main className="min-h-screen bg-black text-white p-10">


      <Link
        href="/marketplace"
        className="inline-block mb-8 bg-blue-600 hover:bg-blue-700 px-5 py-3 rounded-lg"
      >
        ← Return to Marketplace
      </Link>



      <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12">


        <img
          src={
            product.image_url ||
            "https://placehold.co/700x500?text=DATA+MARINE"
          }
          alt={product.name}
          className="rounded-xl w-full object-cover"
        />



        <div>


          <h1 className="text-5xl font-bold">
            {product.name}
          </h1>



          <p className="text-blue-400 text-3xl font-bold mt-6">

            {product.price > 0
              ? `NGN ${Number(product.price).toLocaleString()}`
              : "Contact for Price"}

          </p>



          <p className="mt-6 text-gray-300">

            {product.description || "No description available."}

          </p>



          <p className="mt-5 text-gray-400">

            Stock: {product.stock}

          </p>



          <div className="flex gap-4 mt-10">


            <button
              onClick={() => {

                addToCart({

                  id: product.id,
                  name: product.name,
                  price: product.price,
                  image_url: product.image_url,
                  quantity: 1

                });

                alert("Added to cart!");

              }}

              className="bg-blue-600 hover:bg-blue-700 px-8 py-4 rounded-lg"
            >

              Add to Cart

            </button>




            <button

              onClick={() => {

                addToCart({

                  id: product.id,
                  name: product.name,
                  price: product.price,
                  image_url: product.image_url,
                  quantity: 1

                });

                router.push("/checkout");

              }}

              className="bg-green-600 hover:bg-green-700 px-8 py-4 rounded-lg"
            >

              Buy Now

            </button>


          </div>




          <Link

            href={`https://wa.me/2348102631129?text=I'm interested in ${encodeURIComponent(product.name)}`}

            className="block mt-8 text-green-400 font-bold"

          >

            WhatsApp Enquiry

          </Link>



        </div>


      </div>


    </main>

  );

}