import Reveal from "@/components/motion/reveal";

export default function RexCertified() {
  return (
    <section className="w-full bg-[#f5f5f5] py-6">
      <div className="tesla-shell">
        <Reveal className="rounded-[22px] bg-[#efefef] px-8 py-8 md:px-12 md:py-10">
          <div className="flex flex-col items-center gap-8 md:flex-row md:items-center md:gap-12">

            {/* Logo badge */}
            <div className="flex shrink-0 items-center justify-center rounded-[16px] bg-white p-5 shadow-sm md:h-[120px] md:w-[120px]">
              <img
                src="/rex-logo.svg"
                alt="REX Certified"
                width={90}
                height={90}
                style={{ width: "90px", height: "auto" }}
                className="object-contain"
              />
            </div>

            {/* Text content */}
            <div className="flex-1 text-center md:text-left">
              <p className="text-[13px] font-bold uppercase tracking-[0.28em] text-[var(--primary)]">
                Certification
              </p>
              <h2 className="mt-1.5 text-2xl font-extrabold tracking-tight text-[var(--foreground)] md:text-3xl">
                REX Certified Exporter
              </h2>
              <p className="mt-2 max-w-2xl text-[0.95rem] leading-7 text-[var(--muted)]">
                Clients in Great Britain, Canada, and Japan can import our tyres
                duty free under our REX certification, reducing import tax costs.
              </p>
            </div>

            {/* Registration + CTA */}
            <div className="flex shrink-0 flex-col items-center gap-3 md:items-end">
              <div className="text-center md:text-right">
                <p className="text-xl font-extrabold tracking-tight text-[var(--foreground)]">
                  DEREX76000242
                </p>
                <p className="mt-0.5 text-[0.82rem] text-[var(--muted)]">
                  Registration Number
                </p>
              </div>
              <a
                href="https://ec.europa.eu/taxation_customs/online-services/online-services-and-databases-customs/rex-registered-exporter-system_en"
                target="_blank"
                rel="noreferrer"
                className="inline-flex h-[44px] items-center justify-center rounded-full border border-black/10 bg-white px-5 text-[13px] font-semibold text-[var(--foreground)] transition hover:bg-[#f0f0f0]"
              >
                Verify Certification
              </a>
            </div>

          </div>
        </Reveal>
      </div>
    </section>
  );
}
