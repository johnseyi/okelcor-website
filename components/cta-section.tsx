import Link from "next/link";
import Reveal from "@/components/motion/reveal";

export default function CTASection() {
  return (
    <section className="w-full bg-[#f5f5f5] py-5">
      <div className="tesla-shell">
        <Reveal className="rounded-[22px] bg-[#efefef] px-6 py-10 text-center md:px-16 md:py-16">
          <p className="text-[13px] font-bold uppercase tracking-[0.28em] text-[var(--primary)]">
            Ready to Work With Okelcor
          </p>

          <h2 className="mx-auto mt-4 max-w-4xl text-3xl font-extrabold tracking-tight text-[var(--foreground)] md:text-4xl lg:text-5xl">
            Ready to build your next tyre supply partnership?
          </h2>

          <p className="mx-auto mt-5 max-w-3xl text-[1rem] leading-8 text-[var(--muted)]">
            Get in touch for catalogue access, wholesale pricing, current stock
            availability, and sourcing support.
          </p>

          <div className="mt-7 flex justify-center">
            <Link
              href="/quote"
              className="inline-flex items-center justify-center rounded-full bg-[var(--primary)] px-8 py-3 text-[14px] font-semibold text-white transition hover:bg-[var(--primary-hover)]"
            >
              Get Your Quote
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
}