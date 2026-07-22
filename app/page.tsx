import Link from "next/link";
import Hero from "@/components/Hero";
import FeaturedProducts from "@/components/FeaturedProducts";
export default function HomePage() {
  return (
    <main>

      {<Hero />}
      {<FeaturedProducts />}
      <section className="bg-slate-900 text-white">

        <div className="max-w-7xl mx-auto px-6 py-28">

          <h1 className="text-6xl font-bold leading-tight">
            Premium Boats
            <br />
            Marine Engines
            <br />
            Accessories
          </h1>

          <p className="mt-8 text-xl max-w-2xl">

            Nigeria's trusted marine marketplace for boats,
            engines, safety equipment, fishing gear and
            custom boat building.

          </p>

          <div className="mt-10 flex gap-5">

            <Link
              href="/marketplace"
              className="bg-blue-600 px-8 py-4 rounded-lg font-semibold"
            >
              Visit Marketplace
            </Link>

            <Link
              href="/customize"
              className="border border-white px-8 py-4 rounded-lg"
            >
              Build Your Boat
            </Link>

          </div>

        </div>

      </section>

      {/* FEATURES */}

      <section className="max-w-7xl mx-auto py-20 px-6">

        <h2 className="text-4xl font-bold text-center">

          Why Choose DATA MARINE?

        </h2>

        <div className="grid md:grid-cols-3 gap-8 mt-14">

          <div className="bg-white p-8 rounded-xl shadow">

            <h3 className="text-xl font-bold">

              Premium Boats

            </h3>

            <p className="mt-3">

              High-quality boats for commercial and
              recreational use.

            </p>

          </div>

          <div className="bg-white p-8 rounded-xl shadow">

            <h3 className="text-xl font-bold">

              Marine Marketplace

            </h3>

            <p className="mt-3">

              Buy engines, accessories, GPS systems,
              safety equipment and more.

            </p>

          </div>

          <div className="bg-white p-8 rounded-xl shadow">

            <h3 className="text-xl font-bold">

              Custom Boat Builder

            </h3>

            <p className="mt-3">

              Configure your dream boat and receive
              a professional quotation.

            </p>

          </div>

        </div>

      </section>

      {/* CALL TO ACTION */}

      <section className="bg-blue-600 text-white py-20">

        <div className="max-w-6xl mx-auto text-center px-6">

          <h2 className="text-5xl font-bold">

            Ready to Get Started?

          </h2>

          <p className="mt-6 text-xl">

            Explore our marketplace or build your own
            customized boat today.

          </p>

          <Link
            href="/marketplace"
            className="inline-block mt-10 bg-white text-blue-700 px-8 py-4 rounded-lg font-bold"
          >
            Shop Now
          </Link>

        </div>

      </section>

    </main>
  );
}