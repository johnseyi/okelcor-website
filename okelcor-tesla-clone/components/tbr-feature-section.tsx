import Link from "next/link";

export default function TbrFeatureSection() {
  return (
    <section className="w-full bg-[#f5f5f5] py-6">
      <div className="tesla-shell">
        <div className="grid overflow-hidden rounded-[22px] bg-[#efefef] md:grid-cols-[1fr_1fr]">

          <div className="relative min-h-[320px] md:min-h-[420px]">
            <div
              className="absolute inset-0 bg-cover bg-center transition-transform duration-700 hover:scale-[1.02]"
              style={{
                backgroundImage: "url('https://i.pinimg.com/1200x/6f/9b/ea/6f9bea11c6fea4aa09174289ffabe399.jpg')",
              }}
            />
          </div>

          <div className="flex items-center px-8 py-10 md:px-12 md:py-12">
            <div className="max-w-[520px]">
              <p className="text-[13px] font-bold uppercase tracking-[0.28em] text-[var(--primary)]">
                TBR Tyres
              </p>

              <h2 className="mt-3 text-3xl font-extrabold leading-[1.05] tracking-tight text-[var(--foreground)] md:text-4xl">
                Brand New TBR Tyres for Global Logistics
              </h2>

              <p className="mt-4 text-[1rem] leading-7 text-[var(--muted)]">
                Top-quality TBR tyres engineered for international transport.
                Built for durability, safety, and performance across every route
                and terrain — with worldwide delivery from trusted premium brands.
              </p>

              <div className="mt-7">
                <Link
                  href="/quote"
                  className="inline-flex h-[42px] items-center justify-center rounded-full bg-[var(--primary)] px-6 text-[0.9rem] font-semibold text-white transition hover:bg-[var(--primary-hover)]"
                >
                  Get Your Quote
                </Link>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
