"use client";

import Link from "next/link";
import Image from "next/image";
import Reveal from "@/components/motion/reveal";
import { StaggerParent, StaggerChild } from "@/components/motion/stagger";
import { useLanguage } from "@/context/language-context";

const brands = [
  { name: "Michelin", src: "/brands/brand%20logo/michelin-logo-6.png" },
  { name: "Bridgestone", src: "/brands/brand%20logo/Bridgestone-Logo.png" },
  { name: "Goodyear", src: "/brands/brand%20logo/goodyear-logo-01.jpg" },
  { name: "Continental", src: "/brands/brand%20logo/Continental_Logo.png" },
  { name: "Pirelli", src: "/brands/brand%20logo/Pirelli_-_logo_full_(Italy,_1997).svg.png" },
  { name: "Dunlop", src: "/brands/brand%20logo/dunlop-3.svg" },
];

export default function Brands() {
  const { t } = useLanguage();
  return (
    <section className="w-full bg-[#f5f5f5] py-6">
      <div className="tesla-shell">
        <div className="grid gap-6 md:grid-cols-2">
          {/* Left panel */}
          <Reveal className="rounded-[22px] bg-[#efefef] p-6 sm:p-8 md:p-12">
            <p className="text-[13px] font-bold uppercase tracking-[0.28em] text-[var(--primary)]">
              {t.brands.eyebrow}
            </p>

            <h2 className="mt-4 max-w-3xl text-3xl font-extrabold tracking-tight text-[var(--foreground)] sm:text-4xl md:text-5xl lg:text-6xl">
              {t.brands.title}
            </h2>

            <p className="mt-5 max-w-2xl text-[1.08rem] leading-8 text-[var(--muted)]">
              {t.brands.body}
            </p>

            <StaggerParent className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-3">
              {brands.map((brand) => (
                <StaggerChild
                  key={brand.name}
                  className="flex min-h-[110px] items-center justify-center rounded-2xl border border-black/5 bg-white p-5 shadow-sm"
                >
                  <Image
                    src={brand.src}
                    alt={brand.name}
                    width={120}
                    height={60}
                    style={{ width: "auto", height: "auto", maxWidth: "110px", maxHeight: "48px" }}
                  />
                </StaggerChild>
              ))}
            </StaggerParent>

            <div className="mt-8">
              <Link
                href="/shop"
                className="inline-flex h-[48px] items-center justify-center rounded-full border border-black/10 bg-white px-6 text-[14px] font-semibold text-[var(--foreground)] transition hover:bg-[#f8f8f8]"
              >
                {t.brands.viewCatalogue}
              </Link>
            </div>
          </Reveal>

          {/* Right panel */}
          <Reveal delay={0.15} className="relative min-h-[280px] overflow-hidden rounded-[22px] md:min-h-[600px]">
            <div
              className="absolute inset-0 bg-cover bg-center transition-transform duration-700 hover:scale-[1.03]"
              style={{
                backgroundImage:
                  "url('/images/logistics.jpg')",
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-black/10 to-black/35" />

            <div className="absolute bottom-0 left-0 right-0 z-10 p-8 md:p-10">
              <p className="text-lg font-medium text-white/90">
                Premium sourcing
              </p>
              <h3 className="mt-2 text-3xl font-extrabold tracking-tight text-white sm:text-4xl md:text-5xl">
                Built for global tyre distribution.
              </h3>

              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  href="/shop"
                  className="inline-flex h-[48px] items-center justify-center rounded-full bg-[var(--primary)] px-6 text-[14px] font-semibold text-white transition hover:bg-[var(--primary-hover)]"
                >
                  {t.brands.exploreSupply}
                </Link>

                <Link
                  href="/about"
                  className="inline-flex h-[48px] items-center justify-center rounded-full bg-white px-6 text-[14px] font-semibold text-black transition hover:bg-gray-100"
                >
                  {t.brands.learnMore}
                </Link>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}