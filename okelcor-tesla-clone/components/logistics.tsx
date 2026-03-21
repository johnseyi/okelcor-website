import Link from "next/link";
import Reveal from "@/components/motion/reveal";

export default function Logistics() {
  return (
    <section className="w-full bg-[#f5f5f5] py-6">
      <div className="tesla-shell">
        <div className="grid gap-6 md:grid-cols-[1.35fr_0.9fr]">
          {/* Large logistics card */}
          <Reveal className="relative min-h-[400px] overflow-hidden rounded-[22px] md:min-h-[580px]">
            <div
              className="absolute inset-0 bg-cover bg-center transition-transform duration-700 hover:scale-105"
              style={{
                backgroundImage:
                  "url('https://images.unsplash.com/photo-1494412519320-aa613dfb7738?auto=format&fit=crop&w=1800&q=80')",
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-black/12 to-black/55" />

            <div className="absolute bottom-0 left-0 right-0 z-10 p-8 md:p-10">
              <p className="text-lg font-medium text-white/90">
                Reliable Global Supply
              </p>

              <h2 className="mt-2 max-w-4xl text-3xl font-extrabold tracking-tight text-white sm:text-4xl md:text-5xl lg:text-6xl">
                International sourcing and logistics support.
              </h2>

              <p className="mt-4 max-w-2xl text-[1.02rem] leading-8 text-white/80">
                Okelcor supports wholesalers and distributors with dependable
                sourcing, shipping coordination, and long-term supply continuity.
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  href="/quote"
                  className="inline-flex items-center justify-center rounded-full bg-[var(--primary)] px-6 py-3 text-[14px] font-semibold text-white transition hover:bg-[var(--primary-hover)]"
                >
                  Get Quote
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

          {/* Side support card */}
          <Reveal delay={0.15} className="grid gap-6">
            <div
              className="relative overflow-hidden rounded-[22px] min-h-[300px]"
            >
              <div
                className="absolute inset-0 bg-cover bg-center transition-transform duration-700 hover:scale-105"
                style={{
                  backgroundImage:
                    "url('https://i.pinimg.com/1200x/e0/80/51/e080516eb3ebf60c295a1eb97a66c3a2.jpg')",
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-b from-black/8 to-black/45" />

              <div className="absolute bottom-0 left-0 right-0 z-10 p-8">
                <p className="text-base text-white/85">Flexible sourcing</p>
                <h3 className="mt-2 text-3xl font-extrabold tracking-tight text-white md:text-4xl">
                  Used Tyres
                </h3>
              </div>
            </div>

            <div className="rounded-[22px] bg-[#efefef] p-8 md:p-10">
              <p className="text-[13px] font-bold uppercase tracking-[0.28em] text-[var(--primary)]">
                Distribution Support
              </p>

              <h3 className="mt-4 text-3xl font-extrabold tracking-tight text-[var(--foreground)] md:text-4xl">
                Supply planning that helps partners scale.
              </h3>

              <p className="mt-4 text-[1rem] leading-8 text-[var(--muted)]">
                From product selection to delivery coordination, Okelcor
                supports efficient tyre sourcing for growing businesses.
              </p>

              <div className="mt-6">
                <Link
                  href="/contact"
                  className="inline-flex items-center justify-center rounded-full border border-black/10 bg-white px-6 py-3 text-[14px] font-semibold text-black transition hover:bg-[#f8f8f8]"
                >
                  Talk to Sales
                </Link>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}