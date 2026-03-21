import Link from "next/link";
import Reveal from "@/components/motion/reveal";
import { StaggerParent, StaggerChild } from "@/components/motion/stagger";

const brands = [
  { name: "Michelin", src: "/brands/brand%20logo/michelin-logo-6.png" },
  { name: "Bridgestone", src: "/brands/brand%20logo/Bridgestone-Logo.png" },
  { name: "Goodyear", src: "/brands/brand%20logo/goodyear-logo-01.jpg" },
  { name: "Continental", src: "/brands/brand%20logo/Continental_Logo.png" },
  { name: "Pirelli", src: "/brands/brand%20logo/Pirelli_-_logo_full_(Italy,_1997).svg.png" },
  { name: "Dunlop", src: "/brands/brand%20logo/dunlop-3.svg" },
];

export default function Brands() {
  return (
    <section className="w-full bg-[#f5f5f5] py-6">
      <div className="tesla-shell">
        <div className="grid gap-6 md:grid-cols-[1.25fr_1fr]">
          {/* Left panel */}
          <Reveal className="rounded-[22px] bg-[#efefef] p-8 md:p-12">
            <p className="text-[13px] font-bold uppercase tracking-[0.28em] text-[var(--primary)]">
              Trusted Global Brands
            </p>

            <h2 className="mt-4 max-w-3xl text-3xl font-extrabold tracking-tight text-[var(--foreground)] sm:text-4xl md:text-5xl lg:text-6xl">
              Sourcing from brands buyers already trust.
            </h2>

            <p className="mt-5 max-w-2xl text-[1.08rem] leading-8 text-[var(--muted)]">
              Okelcor sources from the world's most trusted tyre manufacturers.
              Our catalogue covers leading brands across PCR, TBR, and
              speciality ranges — giving buyers worldwide access to consistent
              quality and competitive pricing.
            </p>

            <StaggerParent className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-3">
              {brands.map((brand) => (
                <StaggerChild
                  key={brand.name}
                  className="flex min-h-[110px] items-center justify-center rounded-2xl border border-black/5 bg-white p-5 shadow-sm"
                >
                  <img
                    src={brand.src}
                    alt={brand.name}
                    width={120}
                    height={60}
                    style={{ maxWidth: "100%", height: "auto" }}
                    className="object-contain"
                  />
                </StaggerChild>
              ))}
            </StaggerParent>

            <div className="mt-8">
              <Link
                href="/shop"
                className="inline-flex h-[44px] items-center justify-center rounded-full border border-black/10 bg-white px-6 text-[14px] font-semibold text-[var(--foreground)] transition hover:bg-[#f8f8f8]"
              >
                View Catalogue
              </Link>
            </div>
          </Reveal>

          {/* Right panel */}
          <Reveal delay={0.15} className="relative min-h-[280px] overflow-hidden rounded-[22px] md:min-h-[600px]">
            <div
              className="absolute inset-0 bg-cover bg-center transition-transform duration-700 hover:scale-[1.03]"
              style={{
                backgroundImage:
                  "url('https://i.pinimg.com/1200x/12/54/db/1254db7c99849ac98644f7145e2de1e1.jpg')",
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-black/10 to-black/35" />

            <div className="absolute bottom-0 left-0 right-0 z-10 p-8 md:p-10">
              <p className="text-lg font-medium text-white/90">
                Premium sourcing
              </p>
              <h3 className="mt-2 text-4xl font-extrabold tracking-tight text-white md:text-5xl">
                Built for global tyre distribution.
              </h3>

              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  href="/shop"
                  className="inline-flex items-center justify-center rounded-full bg-[var(--primary)] px-6 py-3 text-[14px] font-semibold text-white transition hover:bg-[var(--primary-hover)]"
                >
                  Explore Supply
                </Link>

                <Link
                  href="/about"
                  className="inline-flex items-center justify-center rounded-full bg-white px-6 py-3 text-[14px] font-semibold text-black transition hover:bg-gray-100"
                >
                  Learn More
                </Link>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}