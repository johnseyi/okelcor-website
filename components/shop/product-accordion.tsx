"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import type { Product } from "./data";
import { useLanguage } from "@/context/language-context";
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
  const { t, locale } = useLanguage();
  // The data a buyer decides on (specs, size, load) starts open; the prose
  // (shipping, returns, disclaimer) stays folded. One-open-at-a-time forced a
  // buyer to close the size table to read the load index.
  const [open, setOpen] = useState<Set<string>>(new Set(["specifications", "size", "loadspeed"]));
  const toggle = (key: string) =>
    setOpen((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key); else next.add(key);
      return next;
    });

  const parsed = parseTyreSize(product.size);
  const specParsed = parseSpec(product.spec);

  const a = t.shop.accordion;

  // The Artikelmerkmale sheet arrives assembled from the backend: labels in
  // both languages, empties already skipped, order fixed by the catalogue.
  // German UI gets the German labels the marketing brief was written in.
  const specSheet = product.specifications ?? [];
  const specLabel = (row: { label_de: string; label_en: string }) =>
    locale === "de" ? row.label_de : row.label_en;

  const items: AccordionItem[] = [
    // Rich description first when the marketer has written one: it is the
    // content this page exists to show. Sanitized server-side at save time.
    ...(product.description_html
      ? [{
          key: "description",
          title: locale === "de" ? "Beschreibung" : "Description",
          content: (
            <div
              className="article-body text-[0.88rem] leading-7 text-[var(--muted)] [&_h2]:mt-4 [&_h2]:mb-2 [&_h2]:text-[1.05rem] [&_h2]:font-bold [&_h2]:text-[var(--foreground)] [&_h3]:mt-3 [&_h3]:mb-1.5 [&_h3]:font-semibold [&_h3]:text-[var(--foreground)] [&_p]:mb-3 [&_ul]:mb-3 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:mb-3 [&_ol]:list-decimal [&_ol]:pl-5 [&_a]:text-[var(--primary)] [&_a]:underline [&_img]:my-3 [&_img]:max-w-full [&_img]:rounded-xl [&_table]:my-3 [&_table]:w-full [&_td]:border [&_td]:border-black/10 [&_td]:p-2 [&_th]:border [&_th]:border-black/10 [&_th]:bg-black/[0.03] [&_th]:p-2"
              dangerouslySetInnerHTML={{ __html: product.description_html }}
            />
          ),
        }]
      : []),

    // The full specification sheet, when any of it is filled in.
    ...(specSheet.length > 0
      ? [{
          key: "specifications",
          title: locale === "de" ? "Artikelmerkmale" : "Specifications",
          content: (
            <div>
              {specSheet.map((row) => (
                <Row key={row.key} label={specLabel(row)} value={row.value} />
              ))}
            </div>
          ),
        }]
      : []),

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
                    ? `: ${SPEED_DESC[specParsed.speedIndex]}`
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
    // Shipping: only when the marketer has set the text (site-wide in
    // Settings, or per product). Absent text hides the section entirely.
    ...(product.shipping_info
      ? [{
          key: "shipping",
          title: locale === "de" ? "Versand" : "Shipping",
          content: (
            <p className="whitespace-pre-line text-[0.88rem] leading-7 text-[var(--muted)]">
              {product.shipping_info}
            </p>
          ),
        }]
      : []),

    {
      key: "return",
      title: a.returnPolicy,
      // The marketer's own returns text wins when set: one editable text in
      // Settings instead of copy frozen into the translation files. Until it
      // is set, the existing translated copy keeps rendering unchanged.
      content: product.returns_info ? (
        <p className="whitespace-pre-line text-[0.88rem] leading-7 text-[var(--muted)]">
          {product.returns_info}
        </p>
      ) : (
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

  // No GSAP needed: CSS grid-rows transition handles open/close with zero layout thrash.

  return (
    <>
      <div className="mb-5">
        <h2 className="text-xl font-extrabold tracking-tight text-[var(--foreground)]">
          {t.shop.productDetails}
        </h2>
      </div>
      <div className="divide-y divide-black/[0.07] rounded-[22px] bg-[#efefef]">
        {items.map((item) => {
          const isOpen = open.has(item.key);
          return (
            <div key={item.key}>
              <button
                type="button"
                onClick={() => toggle(item.key)}
                className="flex w-full items-center justify-between px-6 py-5 text-left"
              >
                <span className="text-[1rem] font-semibold text-[var(--foreground)]">
                  {item.title}
                </span>
                <span
                  className="flex shrink-0 transition-transform duration-250 ease-out"
                  style={{ transform: isOpen ? "rotate(180deg)" : "rotate(0deg)" }}
                >
                  <ChevronDown size={18} className="shrink-0 text-[var(--muted)]" />
                </span>
              </button>
              {/* grid-rows: 0fr → 1fr animates height with no layout reads */}
              <div
                className="grid transition-all duration-300 ease-out"
                style={{ gridTemplateRows: isOpen ? "1fr" : "0fr" }}
              >
                <div className="overflow-hidden">
                  <div className="px-6 pb-6">{item.content}</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
