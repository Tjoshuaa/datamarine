import Link from "next/link";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(
  supabaseUrl,
  supabaseAnonKey
);

type BoatBuilt = {
  id: number;
  image_url: string | null;
  name: string | null;
  type: string | null;
  description: string | null;
  featured: boolean | null;
};

export default async function BoatsBuilt() {
  const { data: boats, error } = await supabase
    .from("boats_built")
    .select(
      "id, image_url, name, type, description, featured"
    )
    .order("featured", {
      ascending: false,
    })
    .order("created_at", {
      ascending: false,
    })
    .limit(6);

  if (error) {
    console.error("Boats Built error:", error);
  }

  if (!boats || boats.length === 0) {
    return null;
  }

  return (
    <section className="bg-black text-white py-24 px-6">
      <div className="max-w-7xl mx-auto">

        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">

          <div>
            <p className="text-blue-400 uppercase tracking-[0.25em] text-sm font-semibold">
              DATA MARINE ⚓
            </p>

            <h2 className="text-4xl md:text-5xl font-bold mt-3">
              Boats We've Built
            </h2>

            <p className="text-gray-400 text-lg mt-4 max-w-2xl">
              Explore some of the boats designed and built by
              DATA MARINE for our customers.
            </p>
          </div>

          <Link
            href="/boats-built"
            className="inline-flex items-center justify-center bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-xl font-semibold transition"
          >
            View All Boats →
          </Link>

        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-7 mt-12">

          {boats.map((boat: BoatBuilt) => (

            <div
              key={boat.id}
              className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden hover:border-blue-500 transition group"
            >

              <div className="aspect-[4/3] bg-black overflow-hidden">

                {boat.image_url ? (
                  <img
                    src={boat.image_url}
                    alt={
                      boat.name ||
                      "Boat built by DATA MARINE"
                    }
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                  />
                ) : (
                  <div className="h-full flex items-center justify-center text-gray-600">
                    No image
                  </div>
                )}

              </div>

              <div className="p-6">

                {boat.featured && (
                  <span className="inline-block bg-yellow-400 text-black px-3 py-1 rounded-full text-xs font-bold mb-3">
                    FEATURED
                  </span>
                )}

                <h3 className="text-xl font-bold">
                  {boat.name ||
                    "Boat Built by DATA MARINE"}
                </h3>

                {boat.type && (
                  <p className="text-blue-400 text-sm mt-2">
                    {boat.type}
                  </p>
                )}

                {boat.description && (
                  <p className="text-gray-400 mt-3 line-clamp-3">
                    {boat.description}
                  </p>
                )}

              </div>

            </div>

          ))}

        </div>

      </div>
    </section>
  );
}
