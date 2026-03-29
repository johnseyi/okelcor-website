import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Get in touch with Okelcor for catalogue access, wholesale pricing, sourcing support, and partnership discussions.",
  openGraph: {
    title: "Contact Okelcor – Talk to Our Supply Team",
    description:
      "Reach out for catalogue access, wholesale pricing, tyre sourcing enquiries, and global supply partnerships.",
    url: "/contact",
    type: "website",
  },
  twitter: {
    title: "Contact Okelcor – Talk to Our Supply Team",
    description:
      "Wholesale pricing, tyre sourcing enquiries, and global supply partnerships.",
  },
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
