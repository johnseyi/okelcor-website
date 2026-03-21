import Link from "next/link";

const columns = [
  {
    heading: "Products",
    links: [
      { label: "Shop Catalogue", href: "/shop" },
      { label: "PCR Tyres", href: "/shop" },
      { label: "TBR Tyres", href: "/shop" },
      { label: "Used Tyres", href: "/shop" },
      { label: "Request a Quote", href: "/quote" },
    ],
  },
  {
    heading: "Company",
    links: [
      { label: "About Okelcor", href: "/about" },
      { label: "News & Insights", href: "/news" },
      { label: "Contact Us", href: "/contact" },
      { label: "Locations", href: "/contact" },
    ],
  },
  {
    heading: "Support",
    links: [
      { label: "Get Help", href: "/contact" },
      { label: "REX Certification", href: "/about" },
      { label: "Wholesale Enquiries", href: "/quote" },
      { label: "Logistics Support", href: "/about" },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="w-full bg-[#f5f5f5]">
      <div className="tesla-shell">

        {/* Main footer grid */}
        <div className="border-t border-black/[0.07] py-12 md:py-16">
          <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">

            {/* Brand column */}
            <div>
              <img
                src="/logo/okelcor-logo.png"
                alt="Okelcor"
                style={{ height: "22px", width: "auto" }}
                className="block object-contain"
              />
              <p className="mt-1 text-[8px] font-bold uppercase tracking-[0.28em] text-[var(--primary)]">
                Growing Together
              </p>
              <p className="mt-4 max-w-[260px] text-[0.85rem] leading-6 text-[var(--muted)]">
                Munich-based global tyre supplier delivering PCR, TBR, and used tyres to wholesalers and distributors worldwide.
              </p>
              <div className="mt-5 flex flex-col gap-1.5 text-[0.82rem] text-[var(--muted)]">
                <span>Landsberger Str. 155, 80687 Munich</span>
                <span>+49 (0) 89 / 545 583 60</span>
                <span>info@okelcor.de</span>
              </div>
            </div>

            {/* Link columns */}
            {columns.map((col) => (
              <div key={col.heading}>
                <p className="mb-4 text-[11px] font-bold uppercase tracking-[0.22em] text-[var(--foreground)]">
                  {col.heading}
                </p>
                <ul className="flex flex-col gap-2.5">
                  {col.links.map((link) => (
                    <li key={link.label}>
                      <Link href={link.href} className="footer-link text-[0.88rem]">
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}

          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-black/[0.07] py-5">
          <div className="flex flex-wrap items-center justify-between gap-3 text-[0.78rem] text-[var(--muted)]">
            <span>© 2026 Okelcor GmbH. All rights reserved.</span>
            <div className="flex flex-wrap gap-5">
              <Link href="/contact" className="footer-link">Privacy Policy</Link>
              <Link href="/contact" className="footer-link">Terms & Conditions</Link>
              <Link href="/contact" className="footer-link">Imprint</Link>
            </div>
          </div>
        </div>

      </div>
    </footer>
  );
}
