import Image from "next/image";
import Link from "next/link";

export type ShopPromotion = {
  id: number;
  title: string;
  subheadline?: string | null;
  button_text?: string | null;
  button_link?: string | null;
  image_url?: string | null;
};

export default function ShopPromoBanner({ promo }: { promo: ShopPromotion | null }) {
  const title      = promo?.title       ?? "Premium Tyre Catalogue";
  const sub        = promo?.subheadline ?? "PCR, TBR, Used & OTR tyres from the world's leading brands. Global wholesale supply, fast logistics.";
  const btnText    = promo?.button_text ?? "Browse Catalogue";
  const btnLink    = promo?.button_link ?? "#shop-catalogue";
  const imageUrl   = promo?.image_url   ?? null;
  const isPromo    = !!promo;

  return (
    <section className="relative w-full overflow-hidden pt-[76px] lg:pt-20">
      <div className="relative min-h-[280px] sm:min-h-[300px] md:min-h-[340px]">

        {/* Background */}
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt=""
            fill
            priority
            unoptimized
            className="object-cover object-center"
          />
        ) : (
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: "url('/sections/tyre-bg-light.png')" }}
          />
        )}

        {/* Left-to-right gradient overlay — deep on content side, lighter on right */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/60 to-black/25" />

        {/* Bottom fade into the page background */}
        <div className="absolute bottom-0 left-0 right-0 h-28 bg-gradient-to-t from-[#f5f5f5] to-transparent" />

        {/* Content */}
        <div className="relative z-10 flex min-h-[280px] sm:min-h-[300px] md:min-h-[340px] flex-col justify-center px-6 py-10 md:px-12 lg:px-24">
          <div className="max-w-2xl">

            {/* Badge */}
            {isPromo ? (
              <div className="mb-5 flex items-center gap-3">
                <div className="h-[3px] w-8 rounded-full bg-[#f4511e]" />
                <span className="text-[11px] font-bold uppercase tracking-[0.28em] text-[#f4511e]">
                  Special Offer
                </span>
              </div>
            ) : (
              <div className="mb-5 flex items-center gap-3">
                <div className="h-[3px] w-8 rounded-full bg-[#f4511e]" />
                <span className="text-[11px] font-bold uppercase tracking-[0.28em] text-white/50">
                  Tyre Catalogue
                </span>
              </div>
            )}

            {/* Title */}
            <h1 className="text-[2.1rem] font-extrabold leading-[1.1] tracking-tight text-white sm:text-[2.8rem] md:text-[3.2rem]">
              {title}
            </h1>

            {/* Subheadline */}
            <p className="mt-4 max-w-lg text-[0.97rem] leading-[1.75] text-white/70 sm:text-[1.05rem]">
              {sub}
            </p>

            {/* CTAs */}
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link
                href={btnLink}
                className="inline-flex h-[52px] items-center rounded-full bg-[#f4511e] px-8 text-[0.92rem] font-bold text-white shadow-[0_8px_32px_rgba(244,81,30,0.40)] transition hover:bg-[#e04018] active:scale-[0.98]"
              >
                {btnText}
              </Link>
              <Link
                href="/quote"
                className="inline-flex h-[52px] items-center rounded-full border border-white/25 bg-white/10 px-8 text-[0.92rem] font-semibold text-white backdrop-blur-sm transition hover:bg-white/20"
              >
                Request a Quote
              </Link>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
}
