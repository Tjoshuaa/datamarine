import Link from "next/link";

export default function Hero() {
  return (
    <section className="relative bg-slate-900 text-white overflow-hidden">

      <div className="absolute inset-0 bg-black/50 z-0"></div>

      <div
        className="absolute inset-0 bg-cover bg-center z-0"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1500375592092-40eb2168fd21?auto=format&fit=crop&w=1600&q=80')",
        }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-36">

        <h1 className="text-6xl md:text-7xl font-bold leading-tight max-w-3xl">
          Nigeria's Marine Marketplace
        </h1>

        <p className="mt-8 text-xl max-w-2xl">
          Boats, Marine Engines, Fishing Equipment,
          Safety Gear and Custom Boat Building.
        </p>

        <div className="mt-10 flex flex-col items-start gap-4">

          <Link
            href="/marketplace"
            className="bg-blue-600 hover:bg-blue-700 px-8 py-4 rounded-lg font-bold transition"
          >
            Shop Marketplace
          </Link>

          <Link
            href="/customize"
            className="bg-white text-slate-900 hover:bg-gray-200 px-8 py-4 rounded-lg font-bold transition"
          >
            Build Your Boat
          </Link>

          <Link
            href="/boats-built"
            className="text-white text-sm font-semibold hover:text-blue-400 transition mt-0"
          >
            🚤 Boats We've Built →
          </Link>

        </div>

      </div>

    </section>
  );
}
