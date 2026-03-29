import type { Metadata } from "next";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import PageHero from "@/components/page-hero";
import { COMPANY_LEGAL_NAME, COMPANY_EMAIL, COMPANY_PHONE, COMPANY_ADDRESS_STREET, COMPANY_ADDRESS_CITY, COMPANY_ADDRESS_COUNTRY } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Terms & Conditions",
  description: "Terms and conditions governing use of the Okelcor website and services.",
  robots: { index: false, follow: false },
};

const H2_CLS = "mb-3 mt-8 text-[1.1rem] font-bold text-[var(--foreground)]";
const P_CLS = "text-[0.95rem] leading-7 text-[var(--muted)]";
const LI_CLS = "text-[0.95rem] leading-7 text-[var(--muted)]";

export default function TermsPage() {
  return (
    <main>
      <Navbar />

      <PageHero
        eyebrow="Legal"
        title="Terms & Conditions"
        subtitle="The terms and conditions governing use of our website and services."
        image="/images/logistics.jpg"
      />

      <section className="w-full bg-[#f5f5f5] py-14 md:py-20">
        <div className="tesla-shell">
          <div className="mx-auto max-w-3xl rounded-[22px] bg-white p-8 shadow-[var(--shadow-soft)] md:p-14">

            <p className={P_CLS}>Last updated: March 2026</p>

            <h2 className={H2_CLS}>1. Scope of Application</h2>
            <p className={P_CLS}>
              These General Terms and Conditions apply to all business relationships
              between Okelcor GmbH (hereinafter &quot;Okelcor&quot;) and its customers.
              They apply exclusively to companies, legal entities under public law, and
              special funds under public law within the meaning of §310 Para. 1 BGB
              (German Civil Code).
            </p>

            <h2 className={H2_CLS}>2. Offers and Contract Conclusion</h2>
            <p className={P_CLS}>
              All offers made by Okelcor are subject to change and non-binding. A
              contract is concluded only upon Okelcor&apos;s written order confirmation.
              Quote requests submitted via this website are treated as non-binding
              inquiries until confirmed in writing by Okelcor.
            </p>

            <h2 className={H2_CLS}>3. Prices and Payment</h2>
            <ul className="mt-3 list-inside list-disc space-y-1.5 pl-2">
              <li className={LI_CLS}>All prices are quoted in Euros (€) and are exclusive of applicable VAT unless otherwise stated.</li>
              <li className={LI_CLS}>Payment terms are as specified in the individual order confirmation.</li>
              <li className={LI_CLS}>Okelcor reserves the right to adjust prices in the event of significant cost increases beyond its control.</li>
            </ul>

            <h2 className={H2_CLS}>4. Delivery</h2>
            <p className={P_CLS}>
              Delivery dates are indicative unless expressly confirmed as binding in
              writing. Okelcor is not liable for delays caused by force majeure, supplier
              disruptions, transport delays, or other circumstances beyond its reasonable
              control. Risk of loss passes to the buyer upon handover to the freight
              carrier.
            </p>

            <h2 className={H2_CLS}>5. Quality and Inspection</h2>
            <p className={P_CLS}>
              The buyer is obligated to inspect goods upon receipt without undue delay.
              Defects must be reported in writing within 7 days of receipt for visible
              defects, and within 7 days of discovery for hidden defects. Claims after
              these periods will not be accepted.
            </p>

            <h2 className={H2_CLS}>6. Liability</h2>
            <p className={P_CLS}>
              Okelcor&apos;s liability for damages is limited to cases of intent and
              gross negligence. Liability for slight negligence is excluded, except in
              cases of breach of essential contractual obligations. In the event of
              liability, the amount is limited to the foreseeable, typical damage.
            </p>

            <h2 className={H2_CLS}>7. Retention of Title</h2>
            <p className={P_CLS}>
              All delivered goods remain the property of Okelcor until full payment of
              all outstanding invoices has been received.
            </p>

            <h2 className={H2_CLS}>8. Governing Law and Jurisdiction</h2>
            <p className={P_CLS}>
              These Terms and Conditions are governed by the laws of the Federal Republic
              of Germany, excluding the UN Convention on Contracts for the International
              Sale of Goods (CISG). The exclusive place of jurisdiction for all disputes
              is Munich, Germany.
            </p>

            <h2 className={H2_CLS}>9. Severability</h2>
            <p className={P_CLS}>
              Should any provision of these Terms and Conditions be or become invalid,
              the remaining provisions shall remain in full force and effect.
            </p>

            <h2 className={H2_CLS}>10. Contact</h2>
            <p className={P_CLS}>
              {COMPANY_LEGAL_NAME}<br />
              {COMPANY_ADDRESS_STREET}, {COMPANY_ADDRESS_CITY}, {COMPANY_ADDRESS_COUNTRY}<br />
              Email: {COMPANY_EMAIL}<br />
              Phone: {COMPANY_PHONE}
            </p>

          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
