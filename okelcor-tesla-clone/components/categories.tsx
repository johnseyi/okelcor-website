"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";

type Card = {
  title: string;
  label: string;
  subtitle?: string;
  image: string;
};

const cards: Card[] = [
  {
    title: "PCR Tyres",
    label: "Passenger Range",
    subtitle: "Reliable comfort and everyday road performance",
    image:
      "https://i.pinimg.com/1200x/2b/c4/c0/2bc4c01d9e32b3f1f989037c674e35c2.jpg",
  },
  {
    title: "TBR Tyres",
    label: "Truck & Bus Range",
    subtitle: "Built for logistics, mileage, and commercial durability",
    image:
      "https://i.pinimg.com/736x/2b/b8/ce/2bb8ce0264014f144582b4d5a552f909.jpg",
  },
  {
    title: "Used Tyres",
    label: "Cost-Effective Supply",
    subtitle: "Affordable sourcing for distributors and export buyers",
    image:
      "https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&w=2200&q=80",
  },
  {
    title: "OTR Tyres",
    label: "Heavy Duty Range",
    subtitle: "For construction, industrial, and rugged operations",
    image:
      "https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?auto=format&fit=crop&w=2200&q=80",
  },
];

export default function Categories() {
  const sliderRef = useRef<HTMLDivElement | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const updateActiveIndex = () => {
    if (!sliderRef.current) return;

    const container = sliderRef.current;
    const children = Array.from(container.children) as HTMLElement[];

    if (!children.length) return;

    const containerCenter = container.scrollLeft + container.clientWidth / 2;

    let closestIndex = 0;
    let closestDistance = Infinity;

    children.forEach((child, index) => {
      const childCenter = child.offsetLeft + child.clientWidth / 2;
      const distance = Math.abs(containerCenter - childCenter);

      if (distance < closestDistance) {
        closestDistance = distance;
        closestIndex = index;
      }
    });

    setActiveIndex(closestIndex);
  };

  useEffect(() => {
    updateActiveIndex();
  }, []);

  const scrollToCard = (index: number) => {
    if (!sliderRef.current) return;

    const children = Array.from(sliderRef.current.children) as HTMLElement[];
    const target = children[index];
    if (!target) return;

    const leftOffset = target.offsetLeft - 24;

    sliderRef.current.scrollTo({
      left: leftOffset,
      behavior: "smooth",
    });

    setActiveIndex(index);
  };

  const scrollLeft = () => {
    const nextIndex = Math.max(0, activeIndex - 1);
    scrollToCard(nextIndex);
  };

  const scrollRight = () => {
    const nextIndex = Math.min(cards.length - 1, activeIndex + 1);
    scrollToCard(nextIndex);
  };

  return (
    <section className="w-full bg-[#f5f5f5] py-8 md:py-10">
      <div className="tesla-shell">
        <div className="mb-6 px-1">
          <p className="text-[13px] font-bold uppercase tracking-[0.28em] text-[var(--primary)]">
            Our Range
          </p>
          <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-[var(--foreground)] md:text-4xl">
            Tyre categories for every market
          </h2>
        </div>

        <div className="relative">
          <div
            ref={sliderRef}
            onScroll={updateActiveIndex}
            className="hide-scrollbar flex gap-7 overflow-x-auto scroll-smooth px-1 pb-4 snap-x snap-mandatory"
          >
            {cards.map((card) => (
              <article
                key={card.title}
                className="relative h-[420px] min-w-[88%] snap-start overflow-hidden rounded-[22px] bg-black sm:h-[480px] md:h-[620px] md:min-w-[68%] lg:min-w-[62%]"
              >
                <div
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-700 hover:scale-[1.03]"
                  style={{ backgroundImage: `url('${card.image}')` }}
                />

                <div className="absolute inset-0 bg-gradient-to-b from-black/18 via-black/10 to-black/58" />
                <div className="absolute inset-0 bg-gradient-to-r from-black/20 via-transparent to-black/12" />
                <div className="absolute inset-x-0 top-0 h-[34%] bg-gradient-to-b from-black/18 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 h-[42%] bg-gradient-to-t from-black/58 to-transparent" />

                <div className="relative z-10 flex h-full flex-col justify-between p-6 text-white md:p-10">
                  <div>
                    <p className="text-[1rem] font-semibold md:text-[1.15rem]">
                      {card.label}
                    </p>
                  </div>

                  <div className="max-w-[500px]">
                    <h2 className="text-[2.4rem] font-semibold leading-[0.94] tracking-[-0.045em] md:text-[4rem]">
                      {card.title}
                    </h2>

                    {card.subtitle ? (
                      <p className="mt-3 max-w-[540px] text-[1.04rem] font-medium text-white/95 md:text-[1.15rem]">
                        {card.subtitle}
                      </p>
                    ) : null}

                    <div className="mt-5 flex flex-wrap gap-2">
                      <Link
                        href="/quote"
                        className="inline-flex h-[46px] items-center justify-center rounded-full bg-[var(--primary)] px-6 text-[1rem] font-semibold text-white transition hover:bg-[var(--primary-hover)]"
                      >
                        Order Now
                      </Link>

                      <Link
                        href="/shop"
                        style={{ color: '#171a20' }}
                        className="inline-flex h-[46px] items-center justify-center rounded-full bg-white/95 px-6 text-[1rem] font-semibold transition hover:bg-white"
                      >
                        Learn More
                      </Link>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>

          <button
            type="button"
            onClick={scrollLeft}
            className="absolute left-4 top-1/2 z-20 hidden -translate-y-1/2 items-center justify-center rounded-[10px] bg-white/88 p-3 text-black shadow-[0_8px_24px_rgba(0,0,0,0.12)] backdrop-blur-md transition hover:bg-white md:flex"
            aria-label="Scroll left"
          >
            <ChevronLeft size={24} strokeWidth={2} />
          </button>

          <button
            type="button"
            onClick={scrollRight}
            className="absolute right-4 top-1/2 z-20 hidden -translate-y-1/2 items-center justify-center rounded-[10px] bg-white/88 p-3 text-black shadow-[0_8px_24px_rgba(0,0,0,0.12)] backdrop-blur-md transition hover:bg-white md:flex"
            aria-label="Scroll right"
          >
            <ChevronRight size={24} strokeWidth={2} />
          </button>

          <div className="mt-4 flex items-center justify-center gap-3">
            {cards.map((_, index) => (
              <button
                key={index}
                type="button"
                onClick={() => scrollToCard(index)}
                className={`h-[12px] w-[12px] rounded-full transition ${
                  index === activeIndex ? "bg-[var(--foreground)]" : "bg-black/25"
                }`}
                aria-label={`Go to card ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}