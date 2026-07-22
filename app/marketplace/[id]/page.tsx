import { supabase } from "@/lib/supabase";
import Link from "next/link";

export default async function ProductPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params;

  const { data: product } = await supabase
    .from("products")
    .select("*")
    .eq("id", id)
    .single();

  if (!product) {
    return (
      <div className="max-w-5xl mx-auto p-10">
        <h1 className="text-3xl font-bold">Product not found</h1>
      </div>
    );
  }

  return (
    <main className="max-w-7xl mx-auto p-10">

      <div className="grid md:grid-cols-2 gap-10">

        <img
          src={
            product.image_url ||
            "https://placehold.co/700x500?text=DATA MARINE"
          }
          alt={product.name}
          className="rounded-xl w-full"
        />

        <div>

          <h1 className="text-5xl font-bold">
            {product.name}
          </h1>

          <p className="text-blue-700 text-3xl font-bold mt-6">
            ₦{Number(product.price).toLocaleString()}
          </p>

          <p className="mt-6">
            {product.description || "No description available."}
          </p>

          <p className="mt-6 font-semibold">
            Stock: {product.stock}
          </p>

          <div className="flex gap-4 mt-10">

            <button className="bg-blue-600 text-white px-8 py-4 rounded-lg">
              Add to Cart
            </button>

            <button className="bg-green-600 text-white px-8 py-4 rounded-lg">
              Buy Now
            </button>

          </div>

          <Link
            href={`https://wa.me/234XXXXXXXXXX?text=I'm interested in ${encodeURIComponent(product.name)}`}
            className="block mt-6 text-green-700 font-bold"
          >
            WhatsApp Enquiry
          </Link>

        </div>

      </div>

    </main>
  );
}