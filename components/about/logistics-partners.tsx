const PARTNERS = [
  {
    name: "Hapag-Lloyd",
    category: "Ocean Freight",
    logo: "/partners/download.png",
  },
  {
    name: "DB Schenker",
    category: "Logistics & Transport",
    logo: "/partners/download%20(1).png",
  },
  {
    name: "Fortuna",
    category: "Tyre Brand Partner",
    logo: "/partners/Fortuna-logo.png",
  },
];

export default function LogisticsPartners() {
  return (
    <section className="w-full bg-[#f5f5f5] py-8">
      <div className="tesla-shell">
        <div className="grid gap-6 md:grid-cols-[1.25fr_0.75fr] md:items-stretch">

          {/* Large image card */}
          <div className="relative min-h-[360px] overflow-hidden rounded-[22px] md:min-h-[480px]">
            <div
              className="absolute inset-0 bg-cover bg-center transition-transform duration-700 hover:scale-[1.03]"
              style={{
                backgroundImage:
                  "url('https://images.unsplash.com/photo-1494412519320-aa613dfb7738?auto=format&fit=crop&w=1800&q=80')",
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-black/20 to-black/65" />

            <div className="absolute bottom-0 left-0 right-0 z-10 p-8 md:p-10">
              <p className="text-[13px] font-bold uppercase tracking-[0.28em] text-[var(--primary)]">
                Logistics Reach
              </p>
              <h2 className="mt-3 max-w-lg text-3xl font-extrabold tracking-tight text-white md:text-4xl">
                Tyres delivered to any corner of the world.
              </h2>
              <p className="mt-3 max-w-md text-[0.95rem] leading-7 text-white/80">
                Okelcor coordinates end-to-end freight management for
                international tyre shipments, with full tracking and
                documentation support.
              </p>
            </div>
          </div>

          {/* Partners card */}
          <div className="flex flex-col justify-between rounded-[22px] bg-[#efefef] p-8 md:p-10">
            <div>
              <p className="text-[13px] font-bold uppercase tracking-[0.28em] text-[var(--primary)]">
                Trusted Partners
              </p>
              <h3 className="mt-3 text-2xl font-extrabold tracking-tight text-[var(--foreground)] md:text-3xl">
                Networks built for reliability.
              </h3>
              <p className="mt-4 text-[0.93rem] leading-7 text-[var(--muted)]">
                From freight coordination to tyre brand supply, our trusted
                partners ensure quality and delivery at every step.
              </p>
            </div>

            {/* Partner logo tiles */}
            <div className="mt-8 flex flex-col gap-3">
              {PARTNERS.map((p) => (
                <div
                  key={p.name}
                  className="flex items-center gap-4 rounded-[14px] bg-white px-5 py-4"
                >
                  <div className="flex h-10 w-[120px] shrink-0 items-center">
                    <img
                      src={p.logo}
                      alt={p.name}
                      className="h-full w-full object-contain"
                    />
                  </div>
                  <div className="min-w-0 border-l border-black/[0.07] pl-4">
                    <p className="text-[0.88rem] font-extrabold text-[var(--foreground)]">
                      {p.name}
                    </p>
                    <p className="mt-0.5 text-[0.75rem] text-[var(--muted)]">
                      {p.category}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
