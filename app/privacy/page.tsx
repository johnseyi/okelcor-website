import type { Metadata } from "next";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import PageHero from "@/components/page-hero";
import { COMPANY_LEGAL_NAME, COMPANY_EMAIL, COMPANY_PHONE, COMPANY_ADDRESS_STREET, COMPANY_ADDRESS_CITY, COMPANY_ADDRESS_COUNTRY } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How Okelcor GmbH collects, uses, and protects your personal data in accordance with GDPR.",
  robots: { index: false, follow: false },
};

const H2_CLS = "mb-3 mt-8 text-[1.1rem] font-bold text-[var(--foreground)]";
const P_CLS = "text-[0.95rem] leading-7 text-[var(--muted)]";
const LI_CLS = "text-[0.95rem] leading-7 text-[var(--muted)]";

export default function PrivacyPage() {
  return (
    <main>
      <Navbar />

      <PageHero
        eyebrow="Legal"
        title="Privacy Policy"
        subtitle="How we collect, use, and protect your personal data in accordance with GDPR."
        image="/images/logistics.jpg"
      />

      <section className="w-full bg-[#f5f5f5] py-14 md:py-20">
        <div className="tesla-shell">
          <div className="mx-auto max-w-3xl rounded-[22px] bg-white p-8 shadow-[var(--shadow-soft)] md:p-14">

            <p className={P_CLS}>
              Last updated: March 2026
            </p>

            <h2 className={H2_CLS}>1. Controller</h2>
            <p className={P_CLS}>
              The controller responsible for data processing on this website is:<br /><br />
              {COMPANY_LEGAL_NAME}<br />
              {COMPANY_ADDRESS_STREET}<br />
              {COMPANY_ADDRESS_CITY}, {COMPANY_ADDRESS_COUNTRY}<br />
              Email: {COMPANY_EMAIL}<br />
              Phone: {COMPANY_PHONE}
            </p>

            <h2 className={H2_CLS}>2. Data We Collect</h2>
            <p className={P_CLS}>We may collect the following types of personal data:</p>
            <ul className="mt-3 list-inside list-disc space-y-1.5 pl-2">
              <li className={LI_CLS}>Contact information (name, email address, phone number, company)</li>
              <li className={LI_CLS}>Communication data submitted via our contact and quote forms</li>
              <li className={LI_CLS}>Usage data collected automatically when visiting our website (IP address, browser type, pages visited)</li>
              <li className={LI_CLS}>Cookie data, where consent has been given</li>
            </ul>

            <h2 className={H2_CLS}>3. Purpose and Legal Basis of Processing</h2>
            <p className={P_CLS}>
              We process your data for the following purposes:
            </p>
            <ul className="mt-3 list-inside list-disc space-y-1.5 pl-2">
              <li className={LI_CLS}>Responding to inquiries and quote requests (Art. 6(1)(b) GDPR — contract performance)</li>
              <li className={LI_CLS}>Operating and improving our website (Art. 6(1)(f) GDPR — legitimate interest)</li>
              <li className={LI_CLS}>Complying with legal obligations (Art. 6(1)(c) GDPR)</li>
              <li className={LI_CLS}>Analytics and performance measurement, where consent is given (Art. 6(1)(a) GDPR)</li>
            </ul>

            <h2 className={H2_CLS}>4. Data Retention</h2>
            <p className={P_CLS}>
              We retain personal data only for as long as necessary to fulfil the purposes
              for which it was collected, or as required by applicable law. Inquiry and
              quote data is retained for up to 3 years for business continuity purposes,
              unless a longer retention period is required by law.
            </p>

            <h2 className={H2_CLS}>5. Third-Party Services</h2>
            <p className={P_CLS}>
              Our website may use third-party services including Google Maps for location
              display. These services may process your IP address and usage data. Where
              such processing requires your consent, we will request it before activation.
            </p>

            <h2 className={H2_CLS}>6. Your Rights</h2>
            <p className={P_CLS}>
              Under GDPR, you have the following rights:
            </p>
            <ul className="mt-3 list-inside list-disc space-y-1.5 pl-2">
              <li className={LI_CLS}>Right of access to your personal data (Art. 15 GDPR)</li>
              <li className={LI_CLS}>Right to rectification of inaccurate data (Art. 16 GDPR)</li>
              <li className={LI_CLS}>Right to erasure (Art. 17 GDPR)</li>
              <li className={LI_CLS}>Right to restriction of processing (Art. 18 GDPR)</li>
              <li className={LI_CLS}>Right to data portability (Art. 20 GDPR)</li>
              <li className={LI_CLS}>Right to object to processing (Art. 21 GDPR)</li>
              <li className={LI_CLS}>Right to withdraw consent at any time (Art. 7(3) GDPR)</li>
            </ul>
            <p className="mt-4 text-[0.95rem] leading-7 text-[var(--muted)]">
              To exercise any of these rights, please contact us at {COMPANY_EMAIL}. You
              also have the right to lodge a complaint with a supervisory authority, in
              particular in the EU member state of your habitual residence.
            </p>

            <h2 className={H2_CLS}>7. Cookies</h2>
            <p className={P_CLS}>
              Our website uses cookies to improve your browsing experience. Strictly
              necessary cookies are used without consent. Optional cookies (e.g., analytics)
              are only activated with your explicit consent. You can manage or withdraw
              cookie consent at any time via the consent banner.
            </p>

            <h2 className={H2_CLS}>8. Changes to This Policy</h2>
            <p className={P_CLS}>
              We may update this Privacy Policy from time to time. We will notify you of
              significant changes by posting the updated policy on this page with a revised
              date. We encourage you to review this page periodically.
            </p>

            <h2 className={H2_CLS}>9. Contact</h2>
            <p className={P_CLS}>
              For any privacy-related questions or requests, please contact:<br /><br />
              {COMPANY_LEGAL_NAME}<br />
              {COMPANY_ADDRESS_STREET}, {COMPANY_ADDRESS_CITY}, {COMPANY_ADDRESS_COUNTRY}<br />
              Email: {COMPANY_EMAIL}
            </p>

          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
