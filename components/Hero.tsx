import Link from "next/link";

export default function Hero() {
  return (
    <section className="relative bg-slate-900 text-white overflow-hidden">

      <div className="absolute inset-0 bg-black/50"></div>

      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1500375592092-40eb2168fd21?auto=format&fit=crop&w=1600&q=80')",
        }}
      />

      <div className="relative max-w-7xl mx-auto px-6 py-36">

        <h1 className="text-6xl md:text-7xl font-bold leading-tight max-w-3xl">
          Nigeria's Marine Marketplace
        </h1>

        <p className="mt-8 text-xl max-w-2xl">
          Boats, Marine Engines, Fishing Equipment,
          Safety Gear and Custom Boat Building.
        </p>

        <div className="mt-10 flex flex-wrap gap-4">

          <Link
            href="/marketplace"
            className="bg-blue-600 px-8 py-4 rounded-lg font-bold"
          >
            Shop Marketplace
          </Link>

          <Link
            href="/customize"
            className="bg-white text-slate-900 px-8 py-4 rounded-lg font-bold"
          >
            Build Your Boat
          </Link>

        </div>

      </div>

    </section>
  );
}