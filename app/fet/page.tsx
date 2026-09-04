import type { Metadata } from "next";
import { getServerLocale } from "@/lib/locale";
import { getPageMeta } from "@/lib/metadata-i18n";
import Link from "next/link";
import {
  Zap, BarChart3, Leaf, Wrench, CheckCircle2,
  Truck, Tractor, Bus, Anchor, Car, Factory,
  ArrowRight, ChevronDown, ShieldCheck, Download, FileText,
} from "lucide-react";
import EngineLookup from "@/components/fet/engine-lookup";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import AmortizationCalculator from "@/components/fet/amortization-calculator";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getServerLocale();
  const m = getPageMeta("fet", locale);
  return {
    title: m.title,
    description: m.description,
    openGraph: {
      title: m.ogTitle,
      description: m.ogDescription,
      url: "https://www.okelcor.com/fet",
      type: "website",
    },
    twitter: {
      title: m.twitterTitle,
      description: m.twitterDescription,
    },
  };
}

// ─── Section wrapper ──────────────────────────────────────────────────────────

function Section({
  children,
  className = "",
  id,
}: {
  children: React.ReactNode;
  className?: string;
  id?: string;
}) {
  return (
    <section id={id} className={`w-full py-16 md:py-20 ${className}`}>
      <div className="tesla-shell">{children}</div>
    </section>
  );
}

function SectionEyebrow({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.28em] text-[#f4511e]">
      {children}
    </p>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function FetPage() {
  return (
    <main className="min-h-screen bg-[#f5f5f5]">
      <Navbar />

      {/* ── Header: Okelcor's own ink band, not a brand of its own ───────── */}
      <section
        className="w-full bg-[#171a20]"
        style={{ paddingTop: "calc(var(--bar-h, 0px) + 76px)" }}
      >
        <div className="mx-auto max-w-7xl px-4 py-12 lg:px-8 lg:py-16">
          <p className="text-[0.78rem] font-semibold text-[#ff7434]">From Okelcor, for fleets</p>
          <h1 className="mt-2 max-w-3xl text-balance text-3xl font-bold leading-tight tracking-tight text-white sm:text-4xl lg:text-[2.75rem]">
            FET fuel efficiency technology
          </h1>
          <p className="mt-4 max-w-2xl text-pretty text-[1.02rem] leading-relaxed text-white/65">
            A catalytic device fitted to the fuel line that improves combustion,
            cuts consumption by up to 15 percent and lowers CO&#8322; output.
            Compatible with diesel and petrol engines, and matched to your
            fleet through the engine lookup below.
          </p>
          <div className="mt-7 flex flex-wrap items-center gap-3">
            <Link
              href="/tyre-supply-quotation"
              className="inline-flex h-12 items-center gap-2 rounded-md bg-[#f4511e] px-6 text-[0.95rem] font-bold text-white transition-colors hover:bg-[#df4618]"
            >
              Request a quote <ArrowRight size={15} strokeWidth={2.4} />
            </Link>
            <a
              href="#compatibility"
              className="inline-flex h-12 items-center gap-2 rounded-md border border-white/25 px-6 text-[0.95rem] font-semibold text-white transition-colors hover:border-white/60"
            >
              Find your engine <ChevronDown size={15} />
            </a>
          </div>
          <dl className="mt-9 grid max-w-2xl grid-cols-3 gap-6 border-t border-white/10 pt-6">
            <div>
              <dt className="text-[0.72rem] font-medium text-white/45">Fuel saved</dt>
              <dd className="mt-0.5 text-xl font-bold text-white">Up to 15%</dd>
            </div>
            <div>
              <dt className="text-[0.72rem] font-medium text-white/45">Fits</dt>
              <dd className="mt-0.5 text-xl font-bold text-white">Diesel &amp; petrol</dd>
            </div>
            <div>
              <dt className="text-[0.72rem] font-medium text-white/45">Models</dt>
              <dd className="mt-0.5 text-xl font-bold text-white">PRO FI to FIV</dd>
            </div>
          </dl>
        </div>
      </section>

      {/* ── How It Works ─────────────────────────────────────────────────── */}
      <Section id="how-it-works" className="bg-white">
          <SectionEyebrow>How It Works</SectionEyebrow>
          <h2 className="mb-12 text-3xl font-extrabold tracking-tight text-[#111111] md:text-4xl">
            Simple to install, immediate in effect
          </h2>

        <div className="grid gap-5 sm:grid-cols-3">
          {[
            {
              step: "01",
              title: "Install in Fuel Line",
              body: "FET is fitted directly into the vehicle's fuel supply line. No engine modifications, no downtime, and compatible with all diesel and petrol engines.",
            },
            {
              step: "02",
              title: "Activates with Engine Heat",
              body: "As the engine reaches operating temperature, FET's catalytic process begins treating the fuel passing through it, restructuring fuel molecules.",
            },
            {
              step: "03",
              title: "Improves Combustion Efficiency",
              body: "Better structured fuel burns more completely and extracts more energy per litre, which translates directly into fuel savings and lower emissions.",
            },
          ].map(({ step, title, body }, i) => (
              <div className="relative h-full rounded-[18px] border border-[#e2e8e2] bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-[#f4511e]/30 hover:shadow-[0_8px_28px_rgba(34,197,94,0.1)]">
                <span className="mb-4 block font-mono text-[2.5rem] font-extrabold leading-none text-[#f4511e]/20">
                  {step}
                </span>
                <h3 className="text-[1rem] font-extrabold text-[#111111]">{title}</h3>
                <p className="mt-2 text-[0.88rem] leading-6 text-[#6b7280]">{body}</p>
              </div>
          ))}
        </div>
      </Section>

      {/* ── Proven Results ── dark green band ────────────────────────────── */}
      <Section className="bg-[#171a20]">
          <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.28em] text-[#f4511e]">
            Proven Results
          </p>
          <h2 className="mb-10 text-3xl font-extrabold tracking-tight text-white md:text-4xl">
            Documented in real conditions
          </h2>

        <div className="grid gap-5 sm:grid-cols-2">
          {[
            {
              stat: "~10.9%",
              label: "Fuel Savings",
              context: "Field test: Unimog winter operation",
              detail:
                "Measured over an extended field test in cold-weather conditions with a Mercedes-Benz Unimog. Consistent savings across the test period.",
            },
            {
              stat: "Up to 15%",
              label: "Fuel Savings",
              context: "Lab test: constant speed runs",
              detail:
                "Controlled laboratory testing at constant speed showed up to 15% improvement in fuel consumption versus an untreated baseline vehicle.",
            },
          ].map(({ stat, label, context, detail }, i) => (
              <div className="h-full rounded-[18px] border border-[#f4511e]/20 bg-[#f4511e]/[0.06] p-8 transition-all duration-300 hover:-translate-y-1 hover:border-[#f4511e]/40 hover:shadow-[0_10px_32px_rgba(34,197,94,0.15)]">
                <p className="text-[3.2rem] font-extrabold leading-none tracking-tight text-white">
                  {stat}
                </p>
                <p className="mt-1.5 text-[1rem] font-bold text-white">{label}</p>
                <p className="mt-0.5 text-[0.8rem] font-semibold uppercase tracking-wider text-[#f4511e]/70">
                  {context}
                </p>
                <p className="mt-4 text-[0.88rem] leading-6 text-white/60">{detail}</p>
              </div>
          ))}
        </div>
      </Section>

      {/* ── Key Benefits ─────────────────────────────────────────────────── */}
      <Section className="bg-[#f5f5f5]">
          <SectionEyebrow>Key Benefits</SectionEyebrow>
          <h2 className="mb-10 text-3xl font-extrabold tracking-tight text-[#111111] md:text-4xl">
            Built for operational reality
          </h2>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[
            {
              icon: Wrench,
              title: "Easy to Retrofit",
              body: "Fits any diesel or petrol engine without mechanical modification. Installation takes under an hour.",
            },
            {
              icon: BarChart3,
              title: "Measurable Impact",
              body: "Savings are documentable. Before/after fuel logs give you clear evidence for fleet reporting.",
            },
            {
              icon: Leaf,
              title: "Reduce Emissions",
              body: "More complete combustion means fewer particulates and lower CO₂ per kilometre driven.",
            },
            {
              icon: Truck,
              title: "Fleet Logic",
              body: "The more vehicles in your fleet, the stronger the ROI. Savings compound across every unit.",
            },
            {
              icon: CheckCircle2,
              title: "Documented & Verifiable",
              body: "Results backed by independent field and lab tests: measured data, not marketing claims.",
            },
            {
              icon: Factory,
              title: "Ready for Real-World Operation",
              body: "Proven across passenger cars, trucks, agricultural machinery, marine, and construction equipment.",
            },
          ].map(({ icon: Icon, title, body }, i) => (
              <div className="h-full rounded-[18px] border border-[#e2e8e2] bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-[#f4511e]/30 hover:shadow-[0_8px_24px_rgba(34,197,94,0.1)]">
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-[#dcfce7]">
                  <Icon size={18} strokeWidth={1.8} className="text-[#f4511e]" />
                </div>
                <h3 className="text-[0.95rem] font-extrabold text-[#111111]">{title}</h3>
                <p className="mt-2 text-[0.85rem] leading-6 text-[#6b7280]">{body}</p>
              </div>
          ))}
        </div>
      </Section>

      {/* ── Applications ─────────────────────────────────────────────────── */}
      <Section className="bg-white">
          <SectionEyebrow>Applications</SectionEyebrow>
          <h2 className="mb-10 text-3xl font-extrabold tracking-tight text-[#111111] md:text-4xl">
            Who it&apos;s for.
          </h2>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {[
            { icon: Car,     label: "Cars & Frequent Drivers" },
            { icon: Truck,   label: "Trucks, Vans & Fleet"     },
            { icon: Tractor, label: "Agriculture / Diesel"     },
            { icon: Factory, label: "Construction Machinery"   },
            { icon: Bus,     label: "Public Transport"         },
            { icon: Anchor,  label: "Marine"                   },
          ].map(({ icon: Icon, label }, i) => (
              <div className="flex h-full flex-col items-center gap-3 rounded-[16px] border border-[#e2e8e2] bg-white p-5 text-center shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-[#f4511e]/30 hover:shadow-[0_6px_20px_rgba(34,197,94,0.1)]">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#dcfce7]">
                  <Icon size={22} strokeWidth={1.7} className="text-[#f4511e]" />
                </div>
                <p className="text-[0.8rem] font-semibold leading-tight text-[#6b7280]">{label}</p>
              </div>
          ))}
        </div>
      </Section>

      {/* ── Amortization Calculator ───────────────────────────────────────── */}
      <Section className="bg-[#f5f5f5]">
          <SectionEyebrow>ROI Calculator</SectionEyebrow>
          <h2 className="mb-3 text-3xl font-extrabold tracking-tight text-[#111111] md:text-4xl">
            Calculate your savings.
          </h2>
          <p className="mb-10 max-w-[520px] text-[0.95rem] leading-7 text-[#6b7280]">
            Enter your vehicle details and see how quickly FET pays for itself.
          </p>
        <AmortizationCalculator />
      </Section>

      {/* ── Proof & Certification ────────────────────────────────────────── */}
      <Section className="bg-white">
          <SectionEyebrow>Proof &amp; Certification</SectionEyebrow>
          <h2 className="mb-10 text-3xl font-extrabold tracking-tight text-[#111111] md:text-4xl">
            Certified. Tested. Verified.
          </h2>

        <div className="grid gap-6 md:grid-cols-2">

          {/* ── Left — ISO Certificate ── */}
          <div className="flex flex-col rounded-[20px] border border-[#e2e8e2] bg-white p-8 shadow-sm">
            <div className="mb-5 inline-flex items-center gap-2 self-start rounded-full bg-[#171a20] px-4 py-1.5">
              <ShieldCheck size={13} strokeWidth={2.2} className="text-[#f4511e]" />
              <span className="text-[0.72rem] font-bold uppercase tracking-[0.18em] text-[#f4511e]">
                ISO 9001:2015 Certified
              </span>
            </div>

            <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-[#dcfce7]">
              <ShieldCheck size={30} strokeWidth={1.7} className="text-[#f4511e]" />
            </div>

            <div className="flex flex-col gap-4 text-[0.88rem]">
              <div>
                <p className="mb-0.5 text-[0.67rem] font-bold uppercase tracking-wider text-[#6b7280]">Company</p>
                <p className="font-semibold text-[#111111]">Collaborate Together And Invest GmbH (CTI)</p>
              </div>
              <div>
                <p className="mb-0.5 text-[0.67rem] font-bold uppercase tracking-wider text-[#6b7280]">Certified by</p>
                <p className="font-semibold text-[#111111]">qm-solutions GmbH, Germany</p>
              </div>
              <div>
                <p className="mb-0.5 text-[0.67rem] font-bold uppercase tracking-wider text-[#6b7280]">Valid until</p>
                <p className="font-semibold text-[#111111]">30 January 2026</p>
              </div>
            </div>

            <a
              href="/documents/CTI-Certificate-ISO9001.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-auto flex items-center justify-center gap-2 rounded-full border border-[#f4511e] px-6 py-3 text-[0.88rem] font-semibold text-[#f4511e] transition hover:bg-[#f4511e] hover:text-white"
            >
              <Download size={14} strokeWidth={2.2} />
              Download Certificate
            </a>
          </div>

          {/* ── Right — Field Test Report ── */}
          <div className="flex flex-col rounded-[20px] border border-[#e2e8e2] bg-white p-8 shadow-sm">
            <h3 className="text-[1.4rem] font-extrabold leading-tight tracking-tight text-[#111111] md:text-[1.6rem]">
              Independently Verified. Real Results.
            </h3>
            <p className="mt-2 text-[0.85rem] leading-6 text-[#6b7280]">
              Field test conducted on a VW T5 van operated by Landesbaubehörde Stadthagen, a German regional state authority. January to October 2025.
            </p>

            <div className="mt-6 grid grid-cols-2 gap-3">
              {([
                { stat: "11.52 → 9.92", unit: "l/100km", label: "Fuel consumption reduction" },
                { stat: "13.9%",        unit: "",         label: "Verified fuel savings"       },
                { stat: "€900–€1,300",  unit: "",         label: "Annual savings estimate"     },
                { stat: "3–5 months",   unit: "",         label: "Full payback period"         },
              ] as const).map(({ stat, unit, label }) => (
                <div key={label} className="rounded-[14px] border border-[#e2e8e2] bg-[#f5f5f5] p-4">
                  <p className="text-[1.2rem] font-extrabold leading-tight text-[#111111]">
                    {stat}
                    {unit && <span className="ml-1 text-[0.7rem] font-bold text-[#6b7280]">{unit}</span>}
                  </p>
                  <p className="mt-1 text-[0.71rem] font-medium text-[#6b7280]">{label}</p>
                </div>
              ))}
            </div>

            <a
              href="/documents/FET-Test-Report-VW-T5.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 flex items-center justify-center gap-2 rounded-full bg-[#f4511e] px-6 py-3 text-[0.88rem] font-semibold text-white transition hover:bg-[#df4618]"
            >
              <Download size={14} strokeWidth={2.2} />
              Download Full Test Report
            </a>

            <p className="mt-4 text-center text-[0.72rem] leading-5 text-[#9ca3af]">
              Tested under real operating conditions. Signed and certified by CTI GmbH, Lippstadt.
            </p>
          </div>

        </div>
      </Section>

      {/* ── Engine Compatibility ─────────────────────────────────────────── */}
      <Section className="bg-[#f5f5f5]" id="compatibility">
          <SectionEyebrow>Engine Compatibility</SectionEyebrow>
          <h2 className="mb-3 text-3xl font-extrabold tracking-tight text-[#111111] md:text-4xl">
            Compatible with your engine?
          </h2>
          <p className="mb-10 max-w-[560px] text-[0.95rem] leading-7 text-[#6b7280]">
            FET works with all standard diesel and petrol engines. Search the database below or download the full compatibility guide for your vehicle category.
          </p>

        {/* PDF download cards */}
          <div className="mb-8 grid gap-4 sm:grid-cols-2">
            {[
              {
                label: "Cars, SUVs & Sports Cars",
                sub:   "Passenger car engines, with a comprehensive model listing",
                href:  "/documents/FET-Engine-Overview-Cars-SUV.pdf",
                icon:  Car,
              },
              {
                label: "Commercial Vehicles (up to 40t)",
                sub:   "Trucks, vans, buses and heavy machinery, with the full engine list",
                href:  "/documents/FET-Engine-Overview-Commercial-Vehicles.pdf",
                icon:  Truck,
              },
            ].map(({ label, sub, href, icon: Icon }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-5 rounded-[18px] border border-[#e2e8e2] bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-[#f4511e]/40 hover:shadow-md"
              >
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#dcfce7]">
                  <Icon size={24} strokeWidth={1.7} className="text-[#f4511e]" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-extrabold text-[#111111]">{label}</p>
                  <p className="mt-0.5 text-[0.83rem] text-[#6b7280]">{sub}</p>
                </div>
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#f4511e]/30 bg-[#f0fdf4] transition group-hover:bg-[#f4511e] group-hover:text-white">
                  <Download size={15} strokeWidth={2} className="text-[#f4511e] group-hover:text-white" />
                </div>
              </a>
            ))}
          </div>

        {/* Live engine search */}
          <EngineLookup />
      </Section>

      {/* ── Bottom CTA ───────────────────────────────────────────────────── */}
      <section className="w-full bg-[#171a20] py-20">
        <div className="tesla-shell flex flex-col items-center text-center">
          <div className="mb-5 inline-flex h-14 w-14 items-center justify-center rounded-full bg-[#f4511e]/15">
            <Zap size={24} strokeWidth={1.8} className="text-[#f4511e]" />
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight text-white md:text-4xl">
            Get non-binding advice
          </h2>
          <p className="mt-3 max-w-[420px] text-[0.95rem] leading-7 text-white/60">
      Not sure if FET is right for your fleet or vehicle? Our team will answer your questions and provide a tailored recommendation  no commitment required.
          </p>
          <Link
            href="/tyre-supply-quotation"
            className="mt-8 flex h-[54px] items-center gap-2 rounded-full bg-[#f4511e] px-10 text-[1rem] font-semibold text-white shadow-[0_16px_40px_rgba(34,197,94,0.3)] transition hover:bg-[#df4618]"
          >
            Request a Quote <ArrowRight size={16} strokeWidth={2} />
          </Link>
          <Link
            href="/shop"
            className="mt-4 text-[0.85rem] font-medium text-white/40 transition hover:text-white/70"
          >
            Back to Tyre Catalogue →
          </Link>
        </div>
      </section>

      <Footer />
    </main>
  );
}
