import { ShieldCheck, FileCheck2, Container, Layers } from "lucide-react";

/**
 * One line of concrete facts, directly under the hero — the pattern
 * Blackcircles runs (amend-free orders, 200,000 Trustpilot reviews, tyre
 * guarantee, PayPal credit): every item is a checkable claim, not an
 * adjective. This strip replaces four separate homepage sections that each
 * restated "we are trustworthy" a different way.
 */
const FACTS = [
  {
    Icon: ShieldCheck,
    title: "ISO 9001 certified",
    sub: "Audited quality management",
  },
  {
    Icon: FileCheck2,
    title: "REX registered exporter",
    sub: "EU preferential-origin paperwork included",
  },
  {
    Icon: Container,
    title: "Container & pallet supply",
    sub: "Sea and road freight, tracked door to door",
  },
  {
    Icon: Layers,
    title: "PCR · TBR · OTR · Used",
    sub: "Four ranges, one supplier, one invoice",
  },
] as const;

export default function TrustStrip() {
  return (
    <section aria-label="Why buy from Okelcor" className="border-b border-black/10 bg-white">
      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-x-6 gap-y-5 px-4 py-5 sm:py-6 lg:grid-cols-4 lg:px-8">
        {FACTS.map(({ Icon, title, sub }) => (
          <div key={title} className="flex items-start gap-3">
            <Icon size={20} strokeWidth={2} className="mt-0.5 shrink-0 text-[#f4511e]" aria-hidden />
            <div>
              <p className="text-[0.88rem] font-semibold leading-tight text-[#171a20]">{title}</p>
              <p className="mt-0.5 text-[0.78rem] leading-snug text-[#5c5e62]">{sub}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
