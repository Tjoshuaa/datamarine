import Link from "next/link";

type Product = {
  id: number;
  name: string;
  price: number;
  image_url?: string | null;
  stock: number;
};

export default function ProductCard({ product }: { product: Product }) {
  return (
    <div className="bg-white rounded-xl shadow hover:shadow-xl transition overflow-hidden">

      <img
        src={
          product.image_url ||
          "https://placehold.co/600x400?text=Datamarine"
        }
        alt={product.name}
        className="w-full h-56 object-cover"
      />

      <div className="p-5">

        <h2 className="text-xl font-bold">
          {product.name}
        </h2>

        <p className="text-blue-700 text-2xl font-bold mt-3">
          ₦{Number(product.price).toLocaleString()}
        </p>

        <p className="text-sm mt-2">
          Stock: {product.stock}
        </p>

        <Link
          href={`/marketplace/${product.id}`}
          className="block mt-5 bg-blue-600 text-white text-center py-3 rounded-lg"
        >
          View Product
        </Link>

      </div>

    </div>
  );
}