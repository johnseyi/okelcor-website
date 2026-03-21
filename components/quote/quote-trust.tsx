"use client";

import { useState } from "react";
import { Tag, Globe, Headphones, ChevronDown } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { StaggerParent, StaggerChild } from "@/components/motion/stagger";
import Reveal from "@/components/motion/reveal";

const TRUST_BLOCKS = [
  {
    Icon: Tag,
    title: "Tailored Wholesale Pricing",
    body: "Every quote is prepared specifically for your order volume, product mix, and destination market. No generic price lists.",
  },
  {
    Icon: Globe,
    title: "Global Delivery Support",
    body: "We coordinate freight to over 30 countries through established logistics partnerships including Hapag-Lloyd and DB Schenker.",
  },
  {
    Icon: Headphones,
    title: "Dedicated Sales Assistance",
    body: "A named Okelcor sales contact handles your request from first enquiry through to confirmed delivery.",
  },
];

const FAQS = [
  {
    q: "How long does it take to receive a quote?",
    a: "Our team aims to respond to all quote requests within one business day. For complex or high-volume requests, we may follow up within 48 hours for additional details before preparing your quotation.",
  },
  {
    q: "Can I request multiple tyre types in one quote?",
    a: "Yes — select 'Mixed Request' in the Tyre Category field and describe your full requirements in the notes section. We will prepare a consolidated quotation covering all product lines.",
  },
  {
    q: "Do you support international delivery?",
    a: "Okelcor ships to over 30 countries worldwide. We handle full export documentation, customs paperwork, and freight coordination through trusted logistics partners.",
  },
  {
    q: "Can I request used and new tyres together?",
    a: "Absolutely. Many of our clients source a combination of premium new tyres and Grade A used tyres to optimise their procurement budget. Include both requirements in your notes and we will quote accordingly.",
  },
];

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-black/[0.07] last:border-0">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between py-4 text-left"
      >
        <span className="pr-4 text-[0.95rem] font-semibold text-[var(--foreground)]">{q}</span>
        <motion.span
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.22, ease: "easeOut" }}
          style={{ display: "flex", flexShrink: 0 }}
        >
          <ChevronDown size={17} className="text-[var(--muted)]" />
        </motion.span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{
              height: { duration: 0.28, ease: [0.25, 0.46, 0.45, 0.94] },
              opacity: { duration: 0.18 },
            }}
            style={{ overflow: "hidden" }}
          >
            <p className="pb-4 text-[0.88rem] leading-7 text-[var(--muted)]">{a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function QuoteTrust() {
  return (
    <section className="w-full bg-[#f5f5f5] pb-12 pt-4">
      <div className="tesla-shell flex flex-col gap-6">

        {/* Trust blocks */}
        <StaggerParent className="grid gap-5 md:grid-cols-3">
          {TRUST_BLOCKS.map(({ Icon, title, body }) => (
            <StaggerChild key={title}>
              <div className="flex flex-col rounded-[22px] bg-[#efefef] p-7">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[var(--primary)]/10">
                  <Icon size={19} strokeWidth={1.8} className="text-[var(--primary)]" />
                </div>
                <h3 className="mt-5 text-[1rem] font-extrabold text-[var(--foreground)]">{title}</h3>
                <p className="mt-2 text-[0.88rem] leading-6 text-[var(--muted)]">{body}</p>
              </div>
            </StaggerChild>
          ))}
        </StaggerParent>

        {/* FAQ */}
        <Reveal className="rounded-[22px] bg-[#efefef] px-7 py-6 md:px-10 md:py-8">
          <p className="text-[13px] font-bold uppercase tracking-[0.28em] text-[var(--primary)]">
            FAQ
          </p>
          <h2 className="mt-2 text-2xl font-extrabold tracking-tight text-[var(--foreground)] md:text-3xl">
            Common questions.
          </h2>
          <div className="mt-6">
            {FAQS.map((faq) => (
              <FaqItem key={faq.q} q={faq.q} a={faq.a} />
            ))}
          </div>
        </Reveal>

      </div>
    </section>
  );
}
