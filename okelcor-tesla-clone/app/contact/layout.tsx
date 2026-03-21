import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact – Okelcor",
  description: "Get in touch with Okelcor for catalogue access, wholesale pricing, sourcing support, and partnership discussions.",
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
