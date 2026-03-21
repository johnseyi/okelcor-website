import Link from "next/link";
import { StaggerParent, StaggerChild } from "@/components/motion/stagger";

export default function WhyOkelcor() {
  return (
    <section className="w-full bg-[#f5f5f5] py-6">
      <div className="tesla-shell">
        <StaggerParent className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-[1.1fr_0.55fr_1.1fr_0.55fr]">

          {/* Card 1 */}
          <StaggerChild className="rounded-[22px] bg-[#efefef] p-6 md:p-10">
            <h2 className="text-3xl font-extrabold tracking-tight text-[var(--foreground)] md:text-4xl lg:text-5xl">
              Why Choose Okelcor
            </h2>
            <p className="mt-3 text-[1rem] leading-7 text-[var(--muted)]">
              Premium tyre sourcing, dependable logistics, and strong supplier
              relationships designed for wholesalers and distributors.
            </p>
            <div className="mt-6">
              <Link
                href="/about"
                className="inline-flex h-[44px] items-center justify-center rounded-full bg-[var(--primary)] px-6 text-[14px] font-semibold text-white transition hover:bg-[var(--primary-hover)]"
              >
                About Okelcor
              </Link>
            </div>
          </StaggerChild>

          {/* Image 1 — hidden on mobile */}
          <StaggerChild
            className="hidden rounded-[22px] bg-cover bg-center md:block"
            style={{
              minHeight: "280px",
              backgroundImage:
                "url('https://i.pinimg.com/1200x/6f/9b/ea/6f9bea11c6fea4aa09174289ffabe399.jpg')",
            }}
          />

          {/* Card 2 */}
          <StaggerChild className="rounded-[22px] bg-[#efefef] p-6 md:p-10">
            <h2 className="text-3xl font-extrabold tracking-tight text-[var(--foreground)] md:text-4xl lg:text-5xl">
              Trusted Supply
            </h2>
            <p className="mt-3 text-[1rem] leading-7 text-[var(--muted)]">
              Competitive pricing, consistent availability, and a long-term
              distribution mindset for growing tyre businesses.
            </p>
            <div className="mt-6">
              <Link
                href="/quote"
                className="inline-flex h-[44px] items-center justify-center rounded-full bg-[var(--primary)] px-6 text-[14px] font-semibold text-white transition hover:bg-[var(--primary-hover)]"
              >
                Request a Quote
              </Link>
            </div>
          </StaggerChild>

          {/* Image 2 — hidden on mobile */}
          <StaggerChild
            className="hidden rounded-[22px] bg-cover bg-center md:block"
            style={{
              minHeight: "280px",
              backgroundImage:
                "url('https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&w=1200&q=80')",
            }}
          />

        </StaggerParent>
      </div>
    </section>
  );
}
