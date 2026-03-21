import { Mail, Phone, MapPin, Clock, CheckCircle2, ShieldCheck, Globe } from "lucide-react";

const STEPS = [
  {
    step: "01",
    title: "We review your request",
    body: "Our sales team carefully reviews your tyre specifications, quantities, and delivery requirements.",
  },
  {
    step: "02",
    title: "We prepare your quotation",
    body: "You receive a tailored price sheet within one business day, including product availability and logistics costs.",
  },
  {
    step: "03",
    title: "We confirm and ship",
    body: "Once you approve the quote, we arrange sourcing, packaging, and international freight coordination.",
  },
];

const WHY_ITEMS = [
  { Icon: Clock,        text: "Response within 1 business day" },
  { Icon: CheckCircle2, text: "Tailored wholesale pricing" },
  { Icon: Globe,        text: "International logistics support" },
  { Icon: ShieldCheck,  text: "Trusted supply from vetted brands" },
];

export default function QuoteSummary() {
  return (
    <div className="flex flex-col gap-5">

      {/* What happens next */}
      <div className="rounded-[22px] bg-[#efefef] p-7 md:p-8">
        <p className="text-[13px] font-bold uppercase tracking-[0.28em] text-[var(--primary)]">
          What Happens Next
        </p>
        <h3 className="mt-2 text-xl font-extrabold tracking-tight text-[var(--foreground)]">
          Fast, simple, and transparent.
        </h3>

        <div className="mt-6 flex flex-col gap-5">
          {STEPS.map(({ step, title, body }) => (
            <div key={step} className="flex gap-4">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--primary)]/10">
                <span className="text-[0.7rem] font-extrabold text-[var(--primary)]">{step}</span>
              </div>
              <div>
                <p className="text-[0.9rem] font-semibold text-[var(--foreground)]">{title}</p>
                <p className="mt-0.5 text-[0.83rem] leading-5 text-[var(--muted)]">{body}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Why Okelcor */}
      <div className="rounded-[22px] bg-[#efefef] p-7 md:p-8">
        <p className="text-[13px] font-bold uppercase tracking-[0.28em] text-[var(--primary)]">
          Why Okelcor
        </p>
        <h3 className="mt-2 text-xl font-extrabold tracking-tight text-[var(--foreground)]">
          Your direct supply partner.
        </h3>
        <ul className="mt-5 flex flex-col gap-3.5">
          {WHY_ITEMS.map(({ Icon, text }) => (
            <li key={text} className="flex items-center gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white">
                <Icon size={14} strokeWidth={1.8} className="text-[var(--primary)]" />
              </div>
              <span className="text-[0.88rem] text-[var(--muted)]">{text}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Contact fallback */}
      <div className="rounded-[22px] bg-[var(--primary)] p-7 md:p-8">
        <p className="text-[13px] font-bold uppercase tracking-[0.28em] text-white/70">
          Prefer to call us?
        </p>
        <h3 className="mt-2 text-xl font-extrabold text-white">
          Reach our sales team directly.
        </h3>
        <div className="mt-5 flex flex-col gap-3.5">
          {[
            { Icon: Mail,    value: "info@okelcor.de" },
            { Icon: Phone,   value: "+49 (0) 89 / 545 583 60" },
            { Icon: MapPin,  value: "Munich, Germany" },
          ].map(({ Icon, value }) => (
            <div key={value} className="flex items-center gap-3">
              <Icon size={14} strokeWidth={1.8} className="shrink-0 text-white/70" />
              <span className="text-[0.88rem] font-medium text-white/90">{value}</span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
