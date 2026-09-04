import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

/**
 * The four ranges as a static grid — replacing a 281-line auto-advancing
 * carousel that hid three of the four behind dots. There are exactly four
 * ranges and they never change; a carousel for a fixed set of four is motion
 * for its own sake, and every platform this design borrowed from (Heuver's
 * TRUCK / OTR / AGRICULTURE tiles most directly) lays them out side by side.
 *
 * Same four photographs the carousel used; same /shop?type= links the rest
 * of the site already understands.
 */
const RANGES = [
  {
    type: "PCR",
    title: "Passenger tyres",
    sub: "Cars, SUVs and vans — summer, winter and all-season",
    img: "/images/pexels-piotr-arnoldes-7862031-6063163.png",
  },
  {
    type: "TBR",
    title: "Truck & bus tyres",
    sub: "Built for mileage and commercial durability",
    img: "/images/pexels-furkanakt-29235902.png",
  },
  {
    type: "OTR",
    title: "OTR tyres",
    sub: "Agriculture, construction and industrial plant",
    img: "/images/OTR tyres.png",
  },
  {
    type: "USED",
    title: "Quality used tyres",
    sub: "Inspected and graded, with batch documentation",
    img: "/images/Used tyres.png",
  },
] as const;

export default function RangeTiles() {
  return (
    <section aria-label="Tyre ranges" className="bg-[#f5f5f5]">
      <div className="mx-auto max-w-7xl px-4 py-14 lg:px-8">
        <div className="mb-7 flex items-end justify-between gap-4">
          <div>
            <h2 className="text-balance text-2xl font-bold tracking-tight text-[#171a20] sm:text-[1.7rem]">
              Four ranges, one supplier
            </h2>
            <p className="mt-1.5 text-[0.95rem] text-[#5c5e62]">
              Every range ships with the same export paperwork and the same invoice.
            </p>
          </div>
          <Link
            href="/shop"
            className="hidden shrink-0 items-center gap-1.5 text-[0.9rem] font-semibold text-[#171a20] underline decoration-black/20 underline-offset-4 transition-colors hover:decoration-[#f4511e] sm:flex"
          >
            Browse all stock
            <ArrowRight size={14} strokeWidth={2.4} aria-hidden />
          </Link>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {RANGES.map((r) => (
            <Link
              key={r.type}
              href={`/shop?type=${r.type}`}
              className="group overflow-hidden rounded-lg border border-black/10 bg-white transition-shadow hover:shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#f4511e]"
            >
              <div className="relative aspect-[4/3] overflow-hidden bg-[#e8e9eb]">
                <Image
                  src={r.img}
                  alt={r.title}
                  fill
                  sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
                  className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                />
              </div>
              <div className="p-4">
                <p className="flex items-center justify-between text-[1rem] font-bold text-[#171a20]">
                  {r.title}
                  <ArrowRight
                    size={15}
                    strokeWidth={2.4}
                    aria-hidden
                    className="text-black/30 transition-colors group-hover:text-[#f4511e]"
                  />
                </p>
                <p className="mt-1 text-[0.82rem] leading-snug text-[#5c5e62]">{r.sub}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
