import Link from "next/link";

export default function BoatsBuilt() {
  return (
    <section className="bg-black text-white px-6 py-10">
      <div className="max-w-7xl mx-auto">

        <Link
          href="/boats-built"
          className="group block"
        >

          <div className="border border-slate-800 bg-slate-900/80 rounded-2xl p-6 md:p-8 hover:border-blue-500 hover:bg-slate-900 transition">

            <div className="flex items-center justify-between gap-5">

              <div>

                <p className="text-blue-400 uppercase tracking-[0.2em] text-xs md:text-sm font-semibold">
                  DATA MARINE ⚓
                </p>

                <h2 className="text-2xl md:text-3xl font-bold mt-2 group-hover:text-blue-400 transition">
                  Boats We've Built
                </h2>

                <p className="text-gray-400 mt-2">
                  Explore boats designed and built by DATA MARINE.
                </p>

              </div>

              <div className="shrink-0">

                <span className="flex items-center justify-center w-12 h-12 rounded-full bg-blue-600 group-hover:bg-blue-500 transition text-xl">
                  →
                </span>

              </div>

            </div>

          </div>

        </Link>

      </div>
    </section>
  );
}
