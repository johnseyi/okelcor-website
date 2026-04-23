import type { Metadata } from "next";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import QuoteHero from "@/components/quote/quote-hero";
import QuoteForm from "@/components/quote/quote-form";
import QuoteSummary from "@/components/quote/quote-summary";
import QuoteTrust from "@/components/quote/quote-trust";

export const metadata: Metadata = {
  title: "Request a Tyre Supply Quote",
  description:
    "Request a tailored tyre supply quotation from Okelcor. PCR, TBR, used tyres, and mixed requests. Global delivery. Response within 1 business day.",
  openGraph: {
    title: "Request a Tyre Supply Quote | Okelcor Tires",
    description:
      "Get a tailored quotation for PCR, TBR, or used tyres. Global delivery. Our team responds within 1 business day.",
    url: "https://www.okelcor.com/quote",
    type: "website",
  },
  twitter: {
    title: "Request a Tyre Supply Quote – Okelcor",
    description:
      "Tailored PCR, TBR, and used tyre quotations. Global delivery. Response within 1 business day.",
  },
};

export default function QuotePage() {
  return (
    <main>
      <Navbar />

      <QuoteHero />

      {/* ── Main two-column section ── */}
      <section className="w-full bg-[#f5f5f5] py-10 md:py-14">
        <div className="tesla-shell">
          <div className="grid gap-6 lg:grid-cols-[1.25fr_0.75fr] lg:items-start">
            <QuoteForm />
            <div className="lg:sticky lg:top-[96px]">
              <QuoteSummary />
            </div>
          </div>
        </div>
      </section>

      {/* ── Trust + FAQ ── */}
      <QuoteTrust />

      <Footer />
    </main>
  );
}
