import type { Metadata } from "next";
import { getServerLocale } from "@/lib/locale";
import { getPageMeta } from "@/lib/metadata-i18n";
import Link from "next/link";
import {
  ArrowRight,
  Check,
  Download,
  ShieldCheck,
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


export default function FetPage() {
  return (
    <main className="min-h-screen bg-[#f5f5f5]">
      <Navbar />

      {/* ── Header: Okelcor's own ink band ──────────────────────────────── */}
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
            cuts consumption and lowers CO&#8322; output. Compatible with diesel
            and petrol engines, and matched to your fleet through the engine
            lookup below.
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
              Find your engine
            </a>
          </div>
          <dl className="mt-9 grid max-w-2xl grid-cols-3 gap-6 border-t border-white/10 pt-6">
            <div>
              <dt className="text-[0.72rem] font-medium text-white/45">Verified saving</dt>
              <dd className="mt-0.5 text-xl font-bold text-white">13.9%</dd>
            </div>
            <div>
              <dt className="text-[0.72rem] font-medium text-white/45">Fits</dt>
              <dd className="mt-0.5 text-xl font-bold text-white">Diesel &amp; petrol</dd>
            </div>
            <div>
              <dt className="text-[0.72rem] font-medium text-white/45">Payback</dt>
              <dd className="mt-0.5 text-xl font-bold text-white">3 to 5 months</dd>
            </div>
          </dl>
        </div>
      </section>

      {/* ── The working tool first: which model fits ─────────────────────── */}
      <section id="compatibility" className="w-full bg-white">
        <div className="mx-auto max-w-7xl px-4 py-14 lg:px-8">
          <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 className="text-balance text-2xl font-bold tracking-tight text-[#171a20] sm:text-[1.7rem]">
                Which FET model fits your engine
              </h2>
              <p className="mt-1.5 max-w-2xl text-[0.95rem] text-[#5c5e62]">
                Four models cover everything from a 1.0 litre city car to heavy
                commercial machinery. Search the database by manufacturer or
                model, or take the full listing as a PDF.
              </p>
            </div>
            <div className="flex shrink-0 flex-col gap-1.5 text-[0.88rem]">
              <a
                href="/documents/FET-Engine-Overview-Cars-SUV.pdf"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 font-semibold text-[#171a20] underline decoration-black/20 underline-offset-4 transition-colors hover:decoration-[#f4511e]"
              >
                <Download size={13} strokeWidth={2.2} aria-hidden />
                Cars, SUVs &amp; sports cars (PDF)
              </a>
              <a
                href="/documents/FET-Engine-Overview-Commercial-Vehicles.pdf"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 font-semibold text-[#171a20] underline decoration-black/20 underline-offset-4 transition-colors hover:decoration-[#f4511e]"
              >
                <Download size={13} strokeWidth={2.2} aria-hidden />
                Commercial vehicles to 40t (PDF)
              </a>
            </div>
          </div>
          <EngineLookup />
        </div>
      </section>

      {/* ── The evidence, as a table of documents ────────────────────────── */}
      <section className="w-full bg-[#f5f5f5]">
        <div className="mx-auto max-w-7xl px-4 py-14 lg:px-8">
          <h2 className="text-balance text-2xl font-bold tracking-tight text-[#171a20] sm:text-[1.7rem]">
            What the tests measured
          </h2>
          <p className="mt-1.5 max-w-2xl text-[0.95rem] text-[#5c5e62]">
            Three independent tests, one of them run by a German public
            authority on its own vehicle. The reports are downloadable, not
            summarised away.
          </p>

          <div className="mt-6 overflow-x-auto rounded-lg border border-black/10 bg-white">
            <table className="w-full min-w-[680px] text-[0.9rem]">
              <thead>
                <tr className="border-b border-black/10 bg-[#fafafa] text-left text-[0.7rem] font-bold uppercase tracking-wide text-[#8c8f94]">
                  <th className="px-4 py-3">Test</th>
                  <th className="px-4 py-3">Vehicle &amp; operator</th>
                  <th className="px-4 py-3">Measured result</th>
                  <th className="px-4 py-3 text-right">Report</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/[0.06]">
                <tr>
                  <td className="px-4 py-3.5 align-top">
                    <p className="font-semibold text-[#171a20]">Field test</p>
                    <p className="text-[0.8rem] text-[#8c8f94]">Jan to Oct 2025, daily operation</p>
                  </td>
                  <td className="px-4 py-3.5 align-top text-[#5c5e62]">
                    VW T5 van, Landesbaubeh&ouml;rde Stadthagen
                    <p className="text-[0.8rem] text-[#8c8f94]">German regional state authority</p>
                  </td>
                  <td className="px-4 py-3.5 align-top">
                    <p className="font-bold tabular-nums text-[#171a20]">11.52 &rarr; 9.92 l/100km</p>
                    <p className="text-[0.8rem] font-semibold text-[#15803d]">13.9% verified saving</p>
                  </td>
                  <td className="px-4 py-3.5 text-right align-top">
                    <a
                      href="/documents/FET-Test-Report-VW-T5.pdf"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 font-semibold text-[#171a20] underline decoration-black/20 underline-offset-4 hover:decoration-[#f4511e]"
                    >
                      <Download size={13} strokeWidth={2.2} aria-hidden /> PDF
                    </a>
                  </td>
                </tr>
                <tr>
                  <td className="px-4 py-3.5 align-top">
                    <p className="font-semibold text-[#171a20]">Field test</p>
                    <p className="text-[0.8rem] text-[#8c8f94]">Winter operation, extended period</p>
                  </td>
                  <td className="px-4 py-3.5 align-top text-[#5c5e62]">Mercedes-Benz Unimog</td>
                  <td className="px-4 py-3.5 align-top">
                    <p className="font-bold tabular-nums text-[#171a20]">About 10.9% saved</p>
                    <p className="text-[0.8rem] text-[#8c8f94]">Consistent across the test period</p>
                  </td>
                  <td className="px-4 py-3.5 text-right align-top text-[0.8rem] text-[#8c8f94]">On request</td>
                </tr>
                <tr>
                  <td className="px-4 py-3.5 align-top">
                    <p className="font-semibold text-[#171a20]">Laboratory</p>
                    <p className="text-[0.8rem] text-[#8c8f94]">Constant speed runs</p>
                  </td>
                  <td className="px-4 py-3.5 align-top text-[#5c5e62]">Against an untreated baseline vehicle</td>
                  <td className="px-4 py-3.5 align-top">
                    <p className="font-bold tabular-nums text-[#171a20]">Up to 15% improvement</p>
                  </td>
                  <td className="px-4 py-3.5 text-right align-top text-[0.8rem] text-[#8c8f94]">On request</td>
                </tr>
              </tbody>
            </table>
          </div>

          <p className="mt-3 text-[0.85rem] text-[#5c5e62]">
            For the T5 class of vehicle that works out to roughly &euro;900 to
            &euro;1,300 saved per year, which pays for the device in 3 to 5
            months. Signed and certified by CTI GmbH, Lippstadt.
          </p>
        </div>
      </section>

      {/* ── How it works: a real sequence, numbered plainly ──────────────── */}
      <section className="w-full bg-white">
        <div className="mx-auto max-w-7xl px-4 py-14 lg:px-8">
          <h2 className="text-balance text-2xl font-bold tracking-tight text-[#171a20] sm:text-[1.7rem]">
            How it works
          </h2>
          <div className="mt-6 grid gap-px overflow-hidden rounded-lg border border-black/10 bg-black/10 sm:grid-cols-3">
            {[
              {
                step: "1",
                title: "Fitted to the fuel line",
                body: "Installed directly into the fuel supply line in under an hour. No engine modification and no downtime.",
              },
              {
                step: "2",
                title: "Activates with engine heat",
                body: "At operating temperature the catalytic process starts treating the fuel passing through, restructuring its molecules.",
              },
              {
                step: "3",
                title: "Burns more completely",
                body: "Better structured fuel extracts more energy per litre, which is where the savings and the lower emissions come from.",
              },
            ].map(({ step, title, body }) => (
              <div key={step} className="bg-white p-5">
                <p className="font-mono text-[0.78rem] font-bold text-[#f4511e]">{step}</p>
                <p className="mt-1.5 text-[0.95rem] font-bold text-[#171a20]">{title}</p>
                <p className="mt-1.5 text-[0.85rem] leading-relaxed text-[#5c5e62]">{body}</p>
              </div>
            ))}
          </div>

          {/* The facts that were six icon cards and six icon tiles, said once */}
          <div className="mt-8 grid gap-x-10 gap-y-2.5 text-[0.9rem] text-[#5c5e62] sm:grid-cols-2">
            {[
              "Retrofits to any diesel or petrol engine without mechanical modification",
              "Savings are documentable with before and after fuel logs, ready for fleet reporting",
              "More complete combustion means fewer particulates and less CO2 per kilometre",
              "Proven across cars, trucks, vans, agricultural machinery, marine and construction plant",
              "The more vehicles in the fleet, the stronger the return; savings compound per unit",
              "Results come from measured field and laboratory data, not from marketing claims",
            ].map((fact) => (
              <p key={fact} className="flex items-start gap-2">
                <Check size={15} strokeWidth={2.6} className="mt-0.5 shrink-0 text-[#f4511e]" aria-hidden />
                {fact}
              </p>
            ))}
          </div>
        </div>
      </section>

      {/* ── ROI calculator: the working tool for the numbers ─────────────── */}
      <section className="w-full bg-[#f5f5f5]">
        <div className="mx-auto max-w-7xl px-4 py-14 lg:px-8">
          <h2 className="text-balance text-2xl font-bold tracking-tight text-[#171a20] sm:text-[1.7rem]">
            Work out the payback for your own fleet
          </h2>
          <p className="mt-1.5 mb-8 max-w-xl text-[0.95rem] text-[#5c5e62]">
            Enter your vehicle details and fuel spend; the calculator shows
            when the device has paid for itself.
          </p>
          <AmortizationCalculator />
        </div>
      </section>

      {/* ── Certification, stated plainly ────────────────────────────────── */}
      <section className="w-full bg-white">
        <div className="mx-auto max-w-7xl px-4 py-14 lg:px-8">
          <div className="flex flex-col gap-5 rounded-lg border border-black/10 bg-white p-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <ShieldCheck size={20} strokeWidth={2} className="mt-0.5 shrink-0 text-[#f4511e]" aria-hidden />
              <div className="text-[0.9rem] leading-relaxed text-[#5c5e62]">
                <p className="font-bold text-[#171a20]">ISO 9001:2015 quality management</p>
                <p>
                  Issued to Collaborate Together And Invest GmbH (CTI) by
                  qm&#8209;solutions GmbH, Germany. Stated validity to 30 January 2026.
                </p>
              </div>
            </div>
            <a
              href="/documents/CTI-Certificate-ISO9001.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-11 shrink-0 items-center gap-2 rounded-md border border-black/20 px-5 text-[0.9rem] font-semibold text-[#171a20] transition-colors hover:border-black/50"
            >
              <Download size={14} strokeWidth={2.2} aria-hidden />
              Download certificate
            </a>
          </div>
        </div>
      </section>

      {/* ── Closing ask, same shape as everywhere else ───────────────────── */}
      <section className="w-full bg-[#171a20]">
        <div className="mx-auto flex max-w-7xl flex-col items-start gap-6 px-4 py-14 sm:flex-row sm:items-center sm:justify-between lg:px-8">
          <div>
            <h2 className="text-balance text-2xl font-bold tracking-tight text-white sm:text-[1.8rem]">
              Not sure it fits your fleet?
            </h2>
            <p className="mt-2 max-w-xl text-pretty text-[0.95rem] leading-relaxed text-white/60">
              Tell us what you run and we come back with a model recommendation
              and a written quote. No commitment attached.
            </p>
          </div>
          <div className="flex shrink-0 flex-wrap items-center gap-3">
            <Link
              href="/tyre-supply-quotation"
              className="inline-flex h-12 items-center gap-2 rounded-md bg-[#f4511e] px-6 text-[0.95rem] font-bold text-white transition-colors hover:bg-[#df4618]"
            >
              Request a quote <ArrowRight size={15} strokeWidth={2.4} />
            </Link>
            <Link
              href="/shop"
              className="inline-flex h-12 items-center rounded-md border border-white/25 px-6 text-[0.95rem] font-semibold text-white transition-colors hover:border-white/60"
            >
              Back to the catalogue
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
