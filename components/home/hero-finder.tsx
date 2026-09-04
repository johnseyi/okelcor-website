import Image from "next/image";
import { apiFetch, type ApiResponse, type Brand } from "@/lib/api";
import FinderCard from "@/components/home/finder-card";

/**
 * The homepage hero: the business stated plainly on the left, the finder on
 * the right. No floating mock-UI cards, no gradients, no animated copy — the
 * pattern every working tyre platform uses, executed in Okelcor's own colours.
 *
 * Server component so the finder's dropdowns arrive populated with the real
 * catalogue facets and the product count is the real one — a made-up
 * "11,650+" that never changes is worse than no number.
 */

type Specs = { widths: string[]; heights: string[]; rims: string[] };

async function loadSpecs(): Promise<Specs | null> {
  try {
    const res = await apiFetch<Specs>("/products/specs", { revalidate: 300, tags: ["specs"] });
    return res.data ?? null;
  } catch {
    return null;
  }
}

async function loadBrands(): Promise<Brand[]> {
  try {
    const res: ApiResponse<Brand[]> = await apiFetch<Brand[]>("/brands", { revalidate: 300, tags: ["brands"] });
    return res.data ?? [];
  } catch {
    return [];
  }
}

async function loadProductTotal(): Promise<number | null> {
  try {
    // in_stock=1 is also what makes the endpoint answer at all: the public
    // index deliberately returns nothing unfiltered.
    const res = await apiFetch<unknown[]>("/products", {
      params: { per_page: "1", in_stock: "1" },
      revalidate: 300,
      tags: ["products-total"],
    });
    const total = res.meta?.total;
    return typeof total === "number" && total > 0 ? total : null;
  } catch {
    return null;
  }
}

export default async function HeroFinder() {
  const [specs, brands, total] = await Promise.all([loadSpecs(), loadBrands(), loadProductTotal()]);

  return (
    <section
      className="relative overflow-hidden bg-[#171a20]"
      /* The navbar is fixed and sits below the utility bar; the hero clears
         both the same way the shop pages do — the --bar-h contract. */
      style={{ paddingTop: "calc(var(--bar-h, 0px) + 76px)" }}
    >
      {/*
        The yard, faintly. The photograph (tyre stacks under the container
        cranes) sits behind the band at low presence, anchored right and
        washed back into the ink with a gradient so the headline side stays
        near-solid. Texture, not a picture competing with the words.
      */}
      <div aria-hidden className="absolute inset-0">
        <Image
          src="/images/tyre-primary.png"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover object-[70%_center] opacity-45"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#171a20] via-[#171a20]/85 to-[#171a20]/35" />
        <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-[#171a20] to-transparent" />
      </div>

      <div className="relative mx-auto grid max-w-7xl items-center gap-10 px-4 py-12 sm:py-14 lg:grid-cols-[1fr_auto] lg:gap-16 lg:px-8 lg:py-16">
        <div className="max-w-xl">
          <h1 className="text-balance text-4xl font-bold leading-[1.08] tracking-tight text-white sm:text-[2.9rem]">
            Tyres by the container, from Munich to your market
          </h1>
          <p className="mt-4 max-w-lg text-pretty text-[1.05rem] leading-relaxed text-white/65">
            Okelcor supplies PCR, TBR, OTR and inspected used tyres to
            distributors and fleets across Europe, Africa and the Middle
            East, with export documentation handled end to end.
          </p>

          <dl className="mt-8 grid max-w-lg grid-cols-3 gap-6 border-t border-white/10 pt-6">
            <div>
              <dt className="text-[0.72rem] font-medium text-white/45">In stock today</dt>
              <dd className="mt-0.5 text-xl font-bold tabular-nums text-white">
                {total ? `${new Intl.NumberFormat("en-GB").format(total)} tyres` : "PCR · TBR · OTR"}
              </dd>
            </div>
            <div>
              <dt className="text-[0.72rem] font-medium text-white/45">Export status</dt>
              <dd className="mt-0.5 text-xl font-bold text-white">REX registered</dd>
            </div>
            <div>
              <dt className="text-[0.72rem] font-medium text-white/45">Based in</dt>
              <dd className="mt-0.5 text-xl font-bold text-white">Munich, DE</dd>
            </div>
          </dl>
        </div>

        <FinderCard specs={specs} brands={brands.map((b) => ({ name: b.name }))} />
      </div>
    </section>
  );
}
