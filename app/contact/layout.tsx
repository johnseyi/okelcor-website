import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact Us – Wholesale & Sourcing Enquiries",
  description:
    "Get in touch with Okelcor for catalogue access, wholesale pricing, sourcing support, and partnership discussions.",
  openGraph: {
    title: "Contact Us – Wholesale & Sourcing Enquiries | Okelcor Tires",
    description:
      "Reach out for catalogue access, wholesale pricing, tyre sourcing enquiries, and global supply partnerships.",
    url: "https://www.okelcor.com/contact",
    type: "website",
  },
  twitter: {
    title: "Contact Us – Wholesale & Sourcing Enquiries | Okelcor Tires",
    description:
      "Wholesale pricing, tyre sourcing enquiries, and global supply partnerships.",
  },
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
