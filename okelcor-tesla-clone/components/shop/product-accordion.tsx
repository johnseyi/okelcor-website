"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import type { Product } from "./data";

type AccordionItem = {
  title: string;
  content: React.ReactNode;
};

function parseTyreSize(size: string) {
  const m = size.match(/^(\d+)\/(\d+)R(\d+\.?\d*)$/);
  if (!m) return null;
  return { width: m[1], ratio: m[2], rim: m[3] };
}

function parseSpec(spec: string) {
  const m = spec.match(/^(\d+(?:\/\d+)?)\s*([A-Z]+)/);
  if (!m) return null;
  return { loadIndex: m[1], speedIndex: m[2] };
}

const SPEED_DESC: Record<string, string> = {
  H: "Up to 210 km/h",
  V: "Up to 240 km/h",
  W: "Up to 270 km/h",
  Y: "Up to 300 km/h",
  Z: "Above 240 km/h",
  T: "Up to 190 km/h",
  S: "Up to 180 km/h",
  L: "Up to 120 km/h",
  M: "Up to 130 km/h",
};

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-black/[0.06] py-2.5 last:border-0">
      <span className="text-[0.88rem] text-[var(--muted)]">{label}</span>
      <span className="text-right text-[0.88rem] font-medium text-[var(--foreground)]">
        {value}
      </span>
    </div>
  );
}

export default function ProductAccordion({ product }: { product: Product }) {
  const [open, setOpen] = useState<string | null>("size");

  const parsed = parseTyreSize(product.size);
  const specParsed = parseSpec(product.spec);

  const items: AccordionItem[] = [
    {
      title: "Size and Pattern",
      content: (
        <div>
          {parsed ? (
            <>
              <Row label="Tyre Size" value={product.size} />
              <Row label="Width" value={`${parsed.width} mm`} />
              <Row label="Aspect Ratio" value={`${parsed.ratio}%`} />
              <Row label="Rim Diameter" value={`${parsed.rim}"`} />
              <Row label="Construction" value="Radial (R)" />
            </>
          ) : (
            <Row label="Tyre Size" value={product.size} />
          )}
          <Row label="Season" value={product.season} />
          <Row label="Tyre Type" value={product.type} />
          <Row label="Brand" value={product.brand} />
        </div>
      ),
    },
    {
      title: "Load / Speed Index",
      content: (
        <div>
          {specParsed ? (
            <>
              <Row label="Specification" value={product.spec} />
              <Row label="Load Index" value={specParsed.loadIndex} />
              <Row
                label="Speed Index"
                value={`${specParsed.speedIndex}${
                  SPEED_DESC[specParsed.speedIndex]
                    ? ` — ${SPEED_DESC[specParsed.speedIndex]}`
                    : ""
                }`}
              />
            </>
          ) : (
            <Row label="Specification" value={product.spec} />
          )}
          <p className="mt-3 text-[0.83rem] leading-6 text-[var(--muted)]">
            The load index indicates the maximum weight each tyre can support.
            The speed index indicates the maximum sustained speed the tyre is rated
            for under full load conditions. Always observe the vehicle
            manufacturer&apos;s minimum requirements.
          </p>
        </div>
      ),
    },
    {
      title: "Return Policy",
      content: (
        <div className="space-y-3 text-[0.88rem] leading-7 text-[var(--muted)]">
          <p>
            Okelcor accepts returns on unused, undamaged tyres in their original
            packaging within <strong className="text-[var(--foreground)]">14 days</strong> of
            delivery, subject to prior written authorisation.
          </p>
          <p>
            Tyres that have been mounted, used, or show signs of installation are
            not eligible for return. Custom orders and special sourcing
            arrangements are non-returnable.
          </p>
          <p>
            To initiate a return, contact our team at{" "}
            <a
              href="mailto:info@okelcor.de"
              className="font-medium text-[var(--primary)] hover:underline"
            >
              info@okelcor.de
            </a>{" "}
            with your order reference and reason for return.
          </p>
        </div>
      ),
    },
    {
      title: "Disclaimer",
      content: (
        <div className="space-y-3 text-[0.88rem] leading-7 text-[var(--muted)]">
          <p>
            Product specifications, pricing, and availability are subject to
            change without notice. Images shown are for illustrative purposes
            only and may not represent the exact item supplied.
          </p>
          <p>
            It is the buyer&apos;s responsibility to ensure that tyres are suitable
            for their intended application, vehicle, and legal requirements in the
            destination country. Okelcor accepts no liability for improper
            installation or use outside of rated specifications.
          </p>
          <p>
            Prices are quoted excluding applicable taxes and duties unless
            otherwise stated. Shipping terms are agreed upon at the time of order
            confirmation.
          </p>
        </div>
      ),
    },
  ];

  return (
    <div className="divide-y divide-black/[0.07] rounded-[22px] bg-[#efefef]">
      {items.map((item) => {
        const isOpen = open === item.title;
        return (
          <div key={item.title}>
            <button
              type="button"
              onClick={() => setOpen(isOpen ? null : item.title)}
              className="flex w-full items-center justify-between px-6 py-5 text-left"
            >
              <span className="text-[1rem] font-semibold text-[var(--foreground)]">
                {item.title}
              </span>
              <motion.span
                animate={{ rotate: isOpen ? 180 : 0 }}
                transition={{ duration: 0.25, ease: "easeOut" }}
                style={{ display: "flex" }}
              >
                <ChevronDown size={18} className="shrink-0 text-[var(--muted)]" />
              </motion.span>
            </button>
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  key="content"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{
                    height: { duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] },
                    opacity: { duration: 0.2 },
                  }}
                  style={{ overflow: "hidden" }}
                >
                  <div className="px-6 pb-6">{item.content}</div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}
