"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";
import type { Product } from "./data";
import { useLanguage } from "@/context/language-context";
import { gsap, ease } from "@/lib/gsap";
import { COMPANY_EMAIL } from "@/lib/constants";

type AccordionItem = {
  key: string;
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
  const { t } = useLanguage();
  const [open, setOpen] = useState<string | null>("size");

  const panelRefs = useRef<Map<string, HTMLDivElement | null>>(new Map());
  const chevronRefs = useRef<Map<string, HTMLSpanElement | null>>(new Map());

  const parsed = parseTyreSize(product.size);
  const specParsed = parseSpec(product.spec);

  const a = t.shop.accordion;

  const items: AccordionItem[] = [
    {
      key: "size",
      title: a.sizePattern,
      content: (
        <div>
          {parsed ? (
            <>
              <Row label={a.tyreSize} value={product.size} />
              <Row label={a.width} value={`${parsed.width} mm`} />
              <Row label={a.aspectRatio} value={`${parsed.ratio}%`} />
              <Row label={a.rimDiameter} value={`${parsed.rim}"`} />
              <Row label={a.construction} value={a.constructionVal} />
            </>
          ) : (
            <Row label={a.tyreSize} value={product.size} />
          )}
          <Row label={a.season} value={product.season} />
          <Row label={a.tyreType} value={product.type} />
          <Row label={a.brand} value={product.brand} />
        </div>
      ),
    },
    {
      key: "loadspeed",
      title: a.loadSpeed,
      content: (
        <div>
          {specParsed ? (
            <>
              <Row label={a.specification} value={product.spec} />
              <Row label={a.loadIndex} value={specParsed.loadIndex} />
              <Row
                label={a.speedIndex}
                value={`${specParsed.speedIndex}${
                  SPEED_DESC[specParsed.speedIndex]
                    ? ` — ${SPEED_DESC[specParsed.speedIndex]}`
                    : ""
                }`}
              />
            </>
          ) : (
            <Row label={a.specification} value={product.spec} />
          )}
          <p className="mt-3 text-[0.83rem] leading-6 text-[var(--muted)]">
            {a.loadNote}
          </p>
        </div>
      ),
    },
    {
      key: "return",
      title: a.returnPolicy,
      content: (
        <div className="space-y-3 text-[0.88rem] leading-7 text-[var(--muted)]">
          <p>
            {a.returnPre}
            <strong className="text-[var(--foreground)]">{a.returnBold}</strong>
            {a.returnPost}
          </p>
          <p>{a.returnP2}</p>
          <p>
            {a.returnP3pre}
            <a
              href={`mailto:${COMPANY_EMAIL}`}
              className="font-medium text-[var(--primary)] hover:underline"
            >
              {COMPANY_EMAIL}
            </a>
            {a.returnP3post}
          </p>
        </div>
      ),
    },
    {
      key: "disclaimer",
      title: a.disclaimer,
      content: (
        <div className="space-y-3 text-[0.88rem] leading-7 text-[var(--muted)]">
          <p>{a.disclaimerP1}</p>
          <p>{a.disclaimerP2}</p>
          <p>{a.disclaimerP3}</p>
        </div>
      ),
    },
  ];

  // Set initial GSAP state on mount — closed panels hidden, open chevron rotated
  useEffect(() => {
    items.forEach((item) => {
      const panel = panelRefs.current.get(item.key);
      const chevron = chevronRefs.current.get(item.key);
      const isOpen = item.key === "size";
      if (panel && !isOpen) gsap.set(panel, { height: 0, opacity: 0 });
      if (chevron && isOpen) gsap.set(chevron, { rotation: 180 });
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Animate panels + chevrons whenever open state changes
  useEffect(() => {
    items.forEach((item) => {
      const panel = panelRefs.current.get(item.key);
      const chevron = chevronRefs.current.get(item.key);
      const isOpen = open === item.key;

      if (panel) {
        if (isOpen) {
          gsap.fromTo(
            panel,
            { height: 0, opacity: 0 },
            { height: "auto", opacity: 1, duration: 0.32, ease: ease.sharp, overwrite: true }
          );
        } else {
          gsap.to(panel, { height: 0, opacity: 0, duration: 0.26, ease: ease.sharp, overwrite: true });
        }
      }

      if (chevron) {
        gsap.to(chevron, { rotation: isOpen ? 180 : 0, duration: 0.25, ease: ease.sharp, overwrite: true });
      }
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  return (
    <>
      <div className="mb-5">
        <h2 className="text-xl font-extrabold tracking-tight text-[var(--foreground)]">
          {t.shop.productDetails}
        </h2>
      </div>
      <div className="divide-y divide-black/[0.07] rounded-[22px] bg-[#efefef]">
        {items.map((item) => {
          const isOpen = open === item.key;
          return (
            <div key={item.key}>
              <button
                type="button"
                onClick={() => setOpen(isOpen ? null : item.key)}
                className="flex w-full items-center justify-between px-6 py-5 text-left"
              >
                <span className="text-[1rem] font-semibold text-[var(--foreground)]">
                  {item.title}
                </span>
                <span
                  ref={(el) => { chevronRefs.current.set(item.key, el); }}
                  style={{ display: "flex" }}
                >
                  <ChevronDown size={18} className="shrink-0 text-[var(--muted)]" />
                </span>
              </button>
              <div
                ref={(el) => { panelRefs.current.set(item.key, el); }}
                style={{ overflow: "hidden" }}
              >
                <div className="px-6 pb-6">{item.content}</div>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
