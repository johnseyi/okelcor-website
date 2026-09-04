import Image from "next/image";
import Link from "next/link";
import type { Brand } from "@/lib/api";

/**
 * The brands we carry, as a logo strip — the whole message IS the logos.
 * Replaces a two-column section whose headline ("Sourcing from brands buyers
 * already trust.") spent forty words saying what Michelin's own mark says in
 * none. Logos come from the live catalogue, so a brand we stop carrying
 * falls off the page by itself.
 */
export default function BrandRow({ brands }: { brands?: Brand[] }) {
  if (!brands?.length) return null;

  return (
    <section aria-label="Brands we carry" className="border-y border-black/10 bg-white">
      <div className="mx-auto max-w-7xl px-4 py-10 lg:px-8">
        <div className="mb-6 flex items-baseline justify-between gap-4">
          <h2 className="text-xl font-bold tracking-tight text-[#171a20]">Brands we carry</h2>
          <Link
            href="/shop"
            className="text-[0.88rem] font-semibold text-[#171a20] underline decoration-black/20 underline-offset-4 transition-colors hover:decoration-[#f4511e]"
          >
            See all in the catalogue
          </Link>
        </div>
        <ul className="grid grid-cols-3 items-center gap-x-8 gap-y-6 sm:grid-cols-4 lg:grid-cols-8">
          {brands.slice(0, 16).map((b) => (
            <li key={b.id} className="flex items-center justify-center">
              <Link href={`/shop?brand=${encodeURIComponent(b.name)}`} title={`${b.name} tyres`} className="block">
                <Image
                  src={b.logo_url}
                  alt={b.name}
                  width={110}
                  height={40}
                  className="h-8 w-auto object-contain opacity-70 grayscale transition-all hover:opacity-100 hover:grayscale-0"
                />
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
