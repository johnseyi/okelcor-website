"use client";

import Link from "next/link";
import Image from "next/image";
import { ShieldCheck, BadgeCheck, Phone, Mail, MapPin, Clock } from "lucide-react";
import NewsletterStrip from "@/components/newsletter-strip";
import { useLanguage } from "@/context/language-context";
import { useSiteSettings } from "@/context/site-settings-context";
import { COMPANY_EMAIL, COMPANY_PHONE, COMPANY_HOURS, COMPANY_ADDRESS_STREET, COMPANY_ADDRESS_CITY } from "@/lib/constants";

export default function Footer() {
  const { t } = useLanguage();
  const s = useSiteSettings();

  // `||`, not `??`: the admin settings can hold a key as an EMPTY STRING
  // (company_address does on production right now), and ?? happily renders
  // it — a map pin with no words next to it.
  const address  = s.company_address || `${COMPANY_ADDRESS_STREET}, ${COMPANY_ADDRESS_CITY}`;
  const phone    = s.company_phone   || COMPANY_PHONE;
  const email    = s.company_email   || COMPANY_EMAIL;

  const columns = [
    {
      heading: t.footer.col.products,
      links: [
        { label: t.footer.links.shopCatalogue, href: "/shop" },
        { label: t.footer.links.pcrTyres, href: "/shop" },
        { label: t.footer.links.tbrTyres, href: "/shop" },
        { label: t.footer.links.usedTyres, href: "/shop" },
        { label: t.footer.links.requestQuote, href: "/tyre-supply-quotation" },
      ],
    },
    {
      heading: t.footer.col.company,
      links: [
        { label: t.footer.links.aboutOkelcor, href: "/wholesale-tire-distributors-europe" },
        { label: t.footer.links.newsInsights, href: "/news" },
        { label: t.footer.links.contactUs, href: "/contact" },
        { label: t.footer.links.locations, href: "/contact" },
      ],
    },
    {
      heading: t.footer.col.support,
      links: [
        { label: t.footer.links.getHelp, href: "/contact" },
        { label: t.footer.links.rex, href: "/wholesale-tire-distributors-europe" },
        { label: t.footer.links.wholesale, href: "/tyre-supply-quotation" },
        { label: t.footer.links.logistics, href: "/wholesale-tire-distributors-europe" },
      ],
    },
  ];

  return (
    <footer className="w-full">
      <NewsletterStrip />

      {/*
        The ink footer every major distributor runs (ATD in navy, Heuver in
        dark grey): it bookends the page with the same ground the hero bands
        use, and it carries the practical block a wholesale buyer actually
        scrolls down for, which is who to call and where the goods come from.
      */}
      <div className="bg-[#171a20] text-white">
        <div className="tesla-shell">
          <div className="grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr_1fr_1.3fr]">

            {/* Identity */}
            <div>
              <Image
                src="/logo/okelcor-logo.png"
                alt="Okelcor"
                width={140}
                height={36}
                className="block object-contain brightness-0 invert"
              />
              <p className="mt-4 max-w-[280px] text-[0.85rem] leading-relaxed text-white/55">
                {t.footer.tagline}
              </p>
              <div className="mt-5 flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-1.5 rounded border border-white/15 px-2.5 py-1.5 text-[0.68rem] font-bold uppercase tracking-wide text-white/70">
                  <ShieldCheck size={12} strokeWidth={2} className="text-[#ff7434]" aria-hidden />
                  ISO 9001:2015
                </span>
                <span className="inline-flex items-center gap-1.5 rounded border border-white/15 px-2.5 py-1.5 text-[0.68rem] font-bold uppercase tracking-wide text-white/70">
                  <BadgeCheck size={12} strokeWidth={2} className="text-[#ff7434]" aria-hidden />
                  REX <span className="font-mono normal-case">DEREX76000242</span>
                </span>
              </div>
            </div>

            {/* Link columns from translations, unchanged data */}
            {columns.map((col) => (
              <div key={col.heading}>
                <p className="mb-4 text-[0.72rem] font-bold uppercase tracking-wide text-white/40">
                  {col.heading}
                </p>
                <ul className="flex flex-col gap-2.5">
                  {col.links.map((link) => (
                    <li key={link.label}>
                      <Link
                        href={link.href}
                        className="text-[0.88rem] text-white/70 transition-colors hover:text-white"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}

            {/* The practical block: who to call, where we are, when */}
            <div>
              <p className="mb-4 text-[0.72rem] font-bold uppercase tracking-wide text-white/40">
                Okelcor GmbH
              </p>
              <ul className="flex flex-col gap-3 text-[0.85rem] text-white/70">
                <li className="flex items-start gap-2.5">
                  <MapPin size={14} strokeWidth={2} className="mt-0.5 shrink-0 text-[#ff7434]" aria-hidden />
                  <span>{address}</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Phone size={14} strokeWidth={2} className="mt-0.5 shrink-0 text-[#ff7434]" aria-hidden />
                  <a href={`tel:${phone.replace(/[^+\d]/g, "")}`} className="transition-colors hover:text-white">{phone}</a>
                </li>
                <li className="flex items-start gap-2.5">
                  <Mail size={14} strokeWidth={2} className="mt-0.5 shrink-0 text-[#ff7434]" aria-hidden />
                  <a href={`mailto:${email}`} className="transition-colors hover:text-white">{email}</a>
                </li>
                <li className="flex items-start gap-2.5">
                  <Clock size={14} strokeWidth={2} className="mt-0.5 shrink-0 text-[#ff7434]" aria-hidden />
                  <span>{COMPANY_HOURS}</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Legal row */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/10 py-6 pr-16 text-[0.78rem] text-white/45 sm:pr-20">
            <p>{t.footer.copyright}</p>
            <div className="flex flex-wrap gap-5">
              <Link href="/privacy" className="transition-colors hover:text-white">{t.footer.privacy}</Link>
              <Link href="/terms" className="transition-colors hover:text-white">{t.footer.terms}</Link>
              <Link href="/imprint" className="transition-colors hover:text-white">{t.footer.imprint}</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
