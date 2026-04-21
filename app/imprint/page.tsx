import type { Metadata } from "next";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import PageHero from "@/components/page-hero";
import {
  COMPANY_LEGAL_NAME,
  COMPANY_EMAIL,
  COMPANY_PHONE,
  COMPANY_FAX,
  COMPANY_ADDRESS_STREET,
  COMPANY_ADDRESS_CITY,
  COMPANY_ADDRESS_COUNTRY,
  COMPANY_VAT_NUMBER,
  COMPANY_REGISTRATION_NR,
  COMPANY_DIRECTOR,
  COMPANY_REPRESENTATIVE,
  COMPANY_REP_ADDRESS,
} from "@/lib/constants";

export const metadata: Metadata = {
  title: "Imprint",
  description: "Legal disclosure and company information for Okelcor GmbH in accordance with §5 TMG.",
  robots: { index: true, follow: true },
};

const SECTION_CLS = "mb-8";
const H2_CLS = "mb-4 mt-8 text-[0.72rem] font-bold uppercase tracking-[0.18em] text-[#E85C1A]";
const P_CLS = "text-[0.95rem] leading-7 text-[var(--muted)]";

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5 py-2.5 sm:flex-row sm:gap-0 border-b border-black/[0.05] last:border-0">
      <span className="w-full shrink-0 text-[0.8rem] font-semibold text-[var(--foreground)] sm:w-44">
        {label}
      </span>
      <span className="text-[0.93rem] text-[var(--muted)]">{value}</span>
    </div>
  );
}

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

            {/* Company */}
            <div className={SECTION_CLS}>
              <h2 className={H2_CLS}>Company Information</h2>
              <div className="divide-y divide-black/[0.05] rounded-[14px] bg-[#fafafa] px-5">
                <InfoRow label="Company"   value={COMPANY_LEGAL_NAME} />
                <InfoRow label="Address"   value={`${COMPANY_ADDRESS_STREET}, ${COMPANY_ADDRESS_CITY}, ${COMPANY_ADDRESS_COUNTRY}`} />
                <InfoRow label="Phone"     value={COMPANY_PHONE} />
                <InfoRow label="Fax"       value={COMPANY_FAX} />
                <InfoRow label="Email"     value={COMPANY_EMAIL} />
              </div>
            </div>

            {/* Registration */}
            <div className={SECTION_CLS}>
              <h2 className={H2_CLS}>Commercial Register</h2>
              <div className="divide-y divide-black/[0.05] rounded-[14px] bg-[#fafafa] px-5">
                <InfoRow label="Legal Form"        value="GmbH (Gesellschaft mit beschränkter Haftung)" />
                <InfoRow label="Register Court"    value="Amtsgericht München" />
                <InfoRow label="Registration No."  value={COMPANY_REGISTRATION_NR} />
                <InfoRow label="VAT ID (§27a UStG)" value={COMPANY_VAT_NUMBER} />
              </div>
            </div>

            {/* Management */}
            <div className={SECTION_CLS}>
              <h2 className={H2_CLS}>Management</h2>
              <div className="divide-y divide-black/[0.05] rounded-[14px] bg-[#fafafa] px-5">
                <InfoRow label="Managing Director" value={COMPANY_DIRECTOR} />
                <InfoRow label="Representative"    value={COMPANY_REPRESENTATIVE} />
                <InfoRow label="Rep. Address"      value={COMPANY_REP_ADDRESS} />
              </div>
            </div>

            {/* Responsible for content */}
            <div className={SECTION_CLS}>
              <h2 className={H2_CLS}>Responsible for Content</h2>
              <p className={P_CLS}>
                Responsible for content pursuant to § 18 Abs. 2 MStV:{" "}
                {COMPANY_DIRECTOR}, {COMPANY_ADDRESS_STREET}, {COMPANY_ADDRESS_CITY},{" "}
                {COMPANY_ADDRESS_COUNTRY}.
              </p>
            </div>

            {/* Dispute resolution */}
            <div className={SECTION_CLS}>
              <h2 className={H2_CLS}>Dispute Resolution</h2>
              <p className={P_CLS}>
                The European Commission provides a platform for online dispute resolution (ODR)
                available at{" "}
                <a
                  href="https://ec.europa.eu/consumers/odr"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#E85C1A] underline underline-offset-2 hover:opacity-80"
                >
                  https://ec.europa.eu/consumers/odr
                </a>
                . We are neither obliged nor willing to participate in dispute resolution
                proceedings before a consumer arbitration board.
              </p>
            </div>

            {/* Liability */}
            <div className={SECTION_CLS}>
              <h2 className={H2_CLS}>Liability for Content</h2>
              <p className={P_CLS}>
                As a service provider, we are responsible for our own content on these pages
                in accordance with general laws pursuant to § 7 Abs. 1 TMG. According to
                §§ 8 to 10 TMG, we are not obligated to monitor transmitted or stored
                third-party information or to investigate circumstances that indicate illegal
                activity. Obligations to remove or block the use of information under general
                law remain unaffected.
              </p>
            </div>

            {/* Copyright */}
            <div>
              <h2 className={H2_CLS}>Copyright</h2>
              <p className={P_CLS}>
                The content and works on these pages created by the site operators are subject
                to German copyright law. Duplication, processing, distribution, or any form of
                commercialisation beyond the scope of the copyright law requires the prior
                written consent of the respective author or creator. Downloads and copies of
                this site are only permitted for private, non-commercial use.
              </p>
            </div>

          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
