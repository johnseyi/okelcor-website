import type { Metadata } from "next";
import Link from "next/link";
import {
  Zap, BarChart3, Leaf, Wrench, CheckCircle2,
  Truck, Tractor, Bus, Anchor, Car, Factory,
  ArrowRight, ChevronRight,
} from "lucide-react";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import AmortizationCalculator from "@/components/fet/amortization-calculator";

export const metadata: Metadata = {
  title: "FET Engine Treatment",
  description:
    "FET Engine Treatment — the fuel efficiency device trusted by fleet operators across Europe. Up to 15% fuel savings, reduced emissions, improved engine performance.",
};

// ─── Section wrapper ──────────────────────────────────────────────────────────

function Section({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <section className={`w-full py-16 md:py-20 ${className}`}>
      <div className="tesla-shell">{children}</div>
    </section>
  );
}

function SectionEyebrow({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.28em] text-[#10b981]">
      {children}
    </p>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function FetPage() {
  return (
    <main className="min-h-screen bg-[#0d1b2e]">
      <Navbar />

      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <section className="relative flex min-h-[88vh] flex-col items-center justify-center overflow-hidden bg-[#060e1a] px-5 pt-[76px] text-center lg:pt-20">
        {/* Subtle radial glow */}
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_40%,rgba(16,185,129,0.08),transparent)]" />

        <div className="relative z-10 max-w-[760px]">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#10b981]/20 bg-[#10b981]/10 px-4 py-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-[#10b981]" />
            <span className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#10b981]">
              Fuel Efficiency Technology
            </span>
          </div>

          <h1 className="text-4xl font-extrabold leading-[1.04] tracking-tight text-white sm:text-5xl md:text-6xl">
            FET Engine Treatment
          </h1>
          <p className="mt-5 text-[1.1rem] leading-7 text-white/60 sm:text-[1.2rem]">
            Save Fuel. Improve Performance. Reduce Emissions.
          </p>

          {/* Benefit pills */}
          <div className="mt-8 flex flex-wrap justify-center gap-2.5">
            {[
              { icon: Zap,     label: "Save Fuel"                  },
              { icon: BarChart3, label: "Improve Engine Performance" },
              { icon: Leaf,    label: "Reduce Emissions"            },
            ].map(({ icon: Icon, label }) => (
              <span
                key={label}
                className="flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-4 py-2 text-[0.85rem] font-semibold text-white/80"
              >
                <Icon size={14} strokeWidth={2} className="text-[#10b981]" />
                {label}
              </span>
            ))}
          </div>

          <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Link
              href="/quote"
              className="flex h-[52px] items-center gap-2 rounded-full bg-[#10b981] px-8 text-[0.95rem] font-semibold text-white shadow-[0_16px_40px_rgba(16,185,129,0.25)] transition hover:bg-[#0ea271]"
            >
              Request a Quote <ArrowRight size={16} strokeWidth={2} />
            </Link>
            <a
              href="#how-it-works"
              className="flex h-[52px] items-center gap-2 rounded-full border border-white/15 px-8 text-[0.95rem] font-semibold text-white/70 transition hover:border-white/30 hover:text-white"
            >
              How it works <ChevronRight size={15} />
            </a>
          </div>
        </div>

        {/* Bottom fade */}
        <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-[#0d1b2e] to-transparent" />
      </section>

      {/* ── How It Works ─────────────────────────────────────────────────── */}
      <Section id="how-it-works" className="bg-[#0d1b2e]">
        <SectionEyebrow>How It Works</SectionEyebrow>
        <h2 className="mb-12 text-3xl font-extrabold tracking-tight text-white md:text-4xl">
          Simple install. Immediate impact.
        </h2>

        <div className="grid gap-5 sm:grid-cols-3">
          {[
            {
              step: "01",
              title: "Install in Fuel Line",
              body: "FET is fitted directly into the vehicle's fuel supply line — no engine modifications, no downtime. Compatible with all diesel and petrol engines.",
            },
            {
              step: "02",
              title: "Activates with Engine Heat",
              body: "As the engine reaches operating temperature, FET's catalytic process begins treating the fuel passing through it, restructuring fuel molecules.",
            },
            {
              step: "03",
              title: "Improves Combustion Efficiency",
              body: "Better-structured fuel burns more completely, extracting more energy per litre — translating directly into fuel savings and lower emissions.",
            },
          ].map(({ step, title, body }) => (
            <div
              key={step}
              className="relative rounded-[18px] bg-white/[0.04] p-6 ring-1 ring-white/[0.07]"
            >
              <span className="mb-4 block font-mono text-[2.5rem] font-extrabold leading-none text-[#10b981]/20">
                {step}
              </span>
              <h3 className="text-[1rem] font-extrabold text-white">{title}</h3>
              <p className="mt-2 text-[0.88rem] leading-6 text-white/50">{body}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* ── Proven Results ───────────────────────────────────────────────── */}
      <Section className="bg-[#091422]">
        <SectionEyebrow>Proven Results</SectionEyebrow>
        <h2 className="mb-10 text-3xl font-extrabold tracking-tight text-white md:text-4xl">
          Documented in real-world conditions.
        </h2>

        <div className="grid gap-5 sm:grid-cols-2">
          {[
            {
              stat: "~10.9%",
              label: "Fuel Savings",
              context: "Field test — Unimog winter operation",
              detail: "Measured over an extended field test in cold-weather conditions with a Mercedes-Benz Unimog. Consistent savings across the test period.",
            },
            {
              stat: "Up to 15%",
              label: "Fuel Savings",
              context: "Lab test — constant-speed runs",
              detail: "Controlled laboratory testing at constant speed showed up to 15% improvement in fuel consumption versus an untreated baseline vehicle.",
            },
          ].map(({ stat, label, context, detail }) => (
            <div
              key={context}
              className="rounded-[18px] bg-[#10b981]/[0.06] p-8 ring-1 ring-[#10b981]/20"
            >
              <p className="text-[3rem] font-extrabold leading-none tracking-tight text-[#10b981]">
                {stat}
              </p>
              <p className="mt-1.5 text-[1rem] font-bold text-white">{label}</p>
              <p className="mt-0.5 text-[0.8rem] font-semibold uppercase tracking-wider text-[#10b981]/60">
                {context}
              </p>
              <p className="mt-4 text-[0.88rem] leading-6 text-white/50">{detail}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* ── Key Benefits ─────────────────────────────────────────────────── */}
      <Section className="bg-[#0d1b2e]">
        <SectionEyebrow>Key Benefits</SectionEyebrow>
        <h2 className="mb-10 text-3xl font-extrabold tracking-tight text-white md:text-4xl">
          Built for operational realities.
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
              body: "Results backed by independent field and lab tests. Not marketing claims — measured data.",
            },
            {
              icon: Factory,
              title: "Ready for Real-World Operation",
              body: "Proven across passenger cars, trucks, agricultural machinery, marine, and construction equipment.",
            },
          ].map(({ icon: Icon, title, body }) => (
            <div
              key={title}
              className="rounded-[18px] bg-white/[0.03] p-6 ring-1 ring-white/[0.06] transition hover:bg-white/[0.05]"
            >
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-[#10b981]/10">
                <Icon size={18} strokeWidth={1.8} className="text-[#10b981]" />
              </div>
              <h3 className="text-[0.95rem] font-extrabold text-white">{title}</h3>
              <p className="mt-2 text-[0.85rem] leading-6 text-white/50">{body}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* ── Applications ─────────────────────────────────────────────────── */}
      <Section className="bg-[#091422]">
        <SectionEyebrow>Applications</SectionEyebrow>
        <h2 className="mb-10 text-3xl font-extrabold tracking-tight text-white md:text-4xl">
          Who it's for.
        </h2>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {[
            { icon: Car,     label: "Cars & Frequent Drivers" },
            { icon: Truck,   label: "Trucks, Vans & Fleet"     },
            { icon: Tractor, label: "Agriculture / Diesel"     },
            { icon: Factory, label: "Construction Machinery"   },
            { icon: Bus,     label: "Public Transport"         },
            { icon: Anchor,  label: "Marine"                   },
          ].map(({ icon: Icon, label }) => (
            <div
              key={label}
              className="flex flex-col items-center gap-3 rounded-[16px] bg-white/[0.04] p-5 text-center ring-1 ring-white/[0.06]"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#10b981]/10">
                <Icon size={22} strokeWidth={1.7} className="text-[#10b981]" />
              </div>
              <p className="text-[0.8rem] font-semibold leading-tight text-white/70">{label}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* ── Amortization Calculator ───────────────────────────────────────── */}
      <Section className="bg-[#0d1b2e]">
        <SectionEyebrow>ROI Calculator</SectionEyebrow>
        <h2 className="mb-3 text-3xl font-extrabold tracking-tight text-white md:text-4xl">
          Calculate your savings.
        </h2>
        <p className="mb-10 max-w-[520px] text-[0.95rem] leading-7 text-white/50">
          Enter your vehicle details and see how quickly FET pays for itself.
        </p>
        <AmortizationCalculator />
      </Section>

      {/* ── Bottom CTA ───────────────────────────────────────────────────── */}
      <section className="w-full bg-[#091422] py-20">
        <div className="tesla-shell flex flex-col items-center text-center">
          <div className="mb-5 inline-flex h-14 w-14 items-center justify-center rounded-full bg-[#10b981]/10">
            <Zap size={24} strokeWidth={1.8} className="text-[#10b981]" />
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight text-white md:text-4xl">
            Get non-binding advice
          </h2>
          <p className="mt-3 max-w-[420px] text-[0.95rem] leading-7 text-white/55">
            Not sure if FET is right for your fleet or vehicle? Our team will answer your questions and provide a tailored recommendation — no commitment required.
          </p>
          <Link
            href="/quote"
            className="mt-8 flex h-[54px] items-center gap-2 rounded-full bg-[#10b981] px-10 text-[1rem] font-semibold text-white shadow-[0_16px_40px_rgba(16,185,129,0.22)] transition hover:bg-[#0ea271]"
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
