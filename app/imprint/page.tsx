import type { Metadata } from "next";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import PageHero from "@/components/page-hero";
import { COMPANY_LEGAL_NAME, COMPANY_EMAIL, COMPANY_PHONE, COMPANY_FAX, COMPANY_ADDRESS_STREET, COMPANY_ADDRESS_CITY, COMPANY_ADDRESS_COUNTRY } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Imprint",
  description: "Legal disclosure and company information for Okelcor GmbH in accordance with §5 TMG.",
  robots: { index: false, follow: false },
};

const SECTION_CLS = "mb-8";
const H2_CLS = "mb-3 text-[1.1rem] font-bold text-[var(--foreground)]";
const P_CLS = "text-[0.95rem] leading-7 text-[var(--muted)]";

export default function ImprintPage() {
  return (
    <main>
      <Navbar />

      <PageHero
        eyebrow="Legal"
        title="Imprint"
        subtitle="Legal disclosure in accordance with §5 TMG (German Telemedia Act)."
        image="/images/pexels-einfoto-2091159.jpg"
      />

      <section className="w-full bg-[#f5f5f5] py-14 md:py-20">
        <div className="tesla-shell">
          <div className="mx-auto max-w-3xl rounded-[22px] bg-white p-8 shadow-[var(--shadow-soft)] md:p-14">

            {/* Developer notice — remove before going live */}
            <div className="mb-8 rounded-[12px] border border-amber-200 bg-amber-50 px-5 py-4">
              <p className="text-[0.85rem] font-semibold text-amber-800">
                Fields marked ⚠ require real legal data before this page goes live.
                Contact your legal/tax advisor to obtain the HRB registration number,
                Managing Director name, and VAT ID.
              </p>
            </div>

            <div className={SECTION_CLS}>
              <h2 className={H2_CLS}>Company Information</h2>
              <p className={P_CLS}>
                {COMPANY_LEGAL_NAME}<br />
                {COMPANY_ADDRESS_STREET}<br />
                {COMPANY_ADDRESS_CITY}<br />
                {COMPANY_ADDRESS_COUNTRY}
              </p>
            </div>

            <div className={SECTION_CLS}>
              <h2 className={H2_CLS}>Contact</h2>
              <p className={P_CLS}>
                Phone: {COMPANY_PHONE}<br />
                Fax: {COMPANY_FAX}<br />
                Email: {COMPANY_EMAIL}
              </p>
            </div>

            <div className={SECTION_CLS}>
              <h2 className={H2_CLS}>Legal Form &amp; Registration</h2>
              <p className={P_CLS}>
                Legal form: GmbH (Gesellschaft mit beschränkter Haftung)<br />
                Register court: Amtsgericht München<br />
                Registration number:{" "}
                <span className="inline-flex items-center gap-1 rounded-[6px] bg-amber-50 px-2 py-0.5 text-[0.85rem] font-semibold text-amber-700 ring-1 ring-amber-200">
                  ⚠ Insert HRB number
                </span>
              </p>
            </div>

            <div className={SECTION_CLS}>
              <h2 className={H2_CLS}>Managing Director</h2>
              <p className={P_CLS}>
                <span className="inline-flex items-center gap-1 rounded-[6px] bg-amber-50 px-2 py-0.5 text-[0.85rem] font-semibold text-amber-700 ring-1 ring-amber-200">
                  ⚠ Insert Managing Director full name
                </span>
              </p>
            </div>

            <div className={SECTION_CLS}>
              <h2 className={H2_CLS}>VAT Identification Number</h2>
              <p className={P_CLS}>
                VAT ID in accordance with §27a of the German Value Added Tax Act:<br />
                <span className="inline-flex items-center gap-1 rounded-[6px] bg-amber-50 px-2 py-0.5 text-[0.85rem] font-semibold text-amber-700 ring-1 ring-amber-200">
                  ⚠ Insert VAT ID (e.g. DE123456789)
                </span>
              </p>
            </div>

            <div className={SECTION_CLS}>
              <h2 className={H2_CLS}>Responsible for Content</h2>
              <p className={P_CLS}>
                Responsible for content in accordance with §55 Abs. 2 RStV:<br />
                <span className="inline-flex items-center gap-1 rounded-[6px] bg-amber-50 px-2 py-0.5 text-[0.85rem] font-semibold text-amber-700 ring-1 ring-amber-200">
                  ⚠ Insert name and address of responsible person
                </span>
              </p>
            </div>

            <div className={SECTION_CLS}>
              <h2 className={H2_CLS}>Dispute Resolution</h2>
              <p className={P_CLS}>
                The European Commission provides a platform for online dispute resolution (ODR)
                which is available at{" "}
                <a
                  href="https://ec.europa.eu/consumers/odr"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[var(--primary)] underline underline-offset-2"
                >
                  https://ec.europa.eu/consumers/odr
                </a>
                .<br /><br />
                We are neither obliged nor willing to participate in dispute resolution
                proceedings before a consumer arbitration board.
              </p>
            </div>

            <div className={SECTION_CLS}>
              <h2 className={H2_CLS}>Liability for Content</h2>
              <p className={P_CLS}>
                As a service provider, we are responsible for our own content on these pages
                in accordance with general laws pursuant to §7 Abs. 1 TMG. According to §§8
                to 10 TMG, however, we as a service provider are not obligated to monitor
                transmitted or stored third-party information or to investigate circumstances
                that indicate illegal activity.
              </p>
            </div>

          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
