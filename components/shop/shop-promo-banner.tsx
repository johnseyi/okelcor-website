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

export default function ShopPromoBanner({ promo }: { promo: ShopPromotion }) {
  return (
    <div className="relative overflow-hidden bg-[#171a20]">
      {promo.image_url && (
        <Image
          src={promo.image_url}
          alt=""
          fill
          className="object-cover opacity-20"
          unoptimized
        />
      )}
      <div className="relative z-10 mx-auto flex max-w-7xl flex-col items-center gap-3 px-6 py-10 text-center sm:gap-4 sm:py-14">
        <h2 className="text-[1.6rem] font-extrabold leading-tight tracking-tight text-white sm:text-[2rem]">
          {promo.title}
        </h2>
        {promo.subheadline && (
          <p className="max-w-xl text-[0.95rem] leading-relaxed text-white/65">
            {promo.subheadline}
          </p>
        )}
        {promo.button_text && promo.button_link && (
          <Link
            href={promo.button_link}
            className="mt-1 inline-block rounded-full bg-[#f4511e] px-8 py-3 text-[0.9rem] font-bold text-white transition hover:bg-[#e04018] active:scale-95"
          >
            {promo.button_text}
          </Link>
        )}
      </div>
    </div>
  );
}
