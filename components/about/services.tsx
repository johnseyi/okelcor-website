import { MessageCircle, Truck, Headphones } from "lucide-react";
import Reveal from "@/components/motion/reveal";
import { StaggerParent, StaggerChild } from "@/components/motion/stagger";
import type { LucideIcon } from "lucide-react";

type Service = {
  Icon: LucideIcon;
  eyebrow: string;
  heading: string;
  body: string;
};

const SERVICES: Service[] = [
  {
    Icon: MessageCircle,
    eyebrow: "1-on-1 Consultation",
    heading: "Expert guidance for every order.",
    body: "Our team provides personalised tyre selection advice, matching your requirements across PCR, TBR, LT, and used stock. From specification to volume planning — we help you make the right call every time.",
  },
  {
    Icon: Truck,
    eyebrow: "Logistics Handling",
    heading: "Global freight, end-to-end.",
    body: "We coordinate international shipping through trusted freight partnerships including Hapag-Lloyd and DB Schenker, ensuring tyres reach their destination efficiently and on schedule — wherever in the world you operate.",
  },
  {
    Icon: Headphones,
    eyebrow: "After Sales Support",
    heading: "Support that continues after delivery.",
    body: "Okelcor's after-sales team remains available post-delivery for claims handling, documentation follow-up, and supply continuity — giving you full confidence throughout the entire procurement process.",
  },
];

export default function Services() {
  return (
    <section className="w-full bg-[#f5f5f5] py-8">
      <div className="tesla-shell">

        {/* Section header */}
        <Reveal className="mb-8 text-center">
          <p className="text-[13px] font-bold uppercase tracking-[0.28em] text-[var(--primary)]">
            What We Offer
          </p>
          <h2 className="mx-auto mt-3 max-w-2xl text-3xl font-extrabold tracking-tight text-[var(--foreground)] md:text-4xl">
            Services built around your supply needs.
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-[1rem] leading-7 text-[var(--muted)]">
            From first enquiry to final delivery, Okelcor supports every stage
            of your tyre procurement journey.
          </p>
        </Reveal>

        {/* Cards */}
        <StaggerParent className="grid gap-5 md:grid-cols-3">
          {SERVICES.map(({ Icon, eyebrow, heading, body }) => (
            <StaggerChild key={eyebrow}>
            <div
              className="flex flex-col rounded-[22px] bg-[#efefef] p-8"
            >
              {/* Icon */}
              <div className="flex h-[52px] w-[52px] items-center justify-center rounded-full bg-[var(--primary)]/10">
                <Icon
                  size={22}
                  strokeWidth={1.8}
                  className="text-[var(--primary)]"
                />
              </div>

              {/* Label */}
              <p className="mt-6 text-[11px] font-bold uppercase tracking-[0.22em] text-[var(--primary)]">
                {eyebrow}
              </p>

              {/* Heading */}
              <h3 className="mt-2 text-[1.18rem] font-extrabold leading-snug text-[var(--foreground)]">
                {heading}
              </h3>

              {/* Body */}
              <p className="mt-3 flex-1 text-[0.93rem] leading-7 text-[var(--muted)]">
                {body}
              </p>
            </div>
            </StaggerChild>
          ))}
        </StaggerParent>

      </div>
    </section>
  );
}
