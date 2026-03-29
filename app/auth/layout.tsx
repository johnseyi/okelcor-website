import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign In",
  description:
    "Sign in or create an Okelcor account to access wholesale pricing, manage orders, and request tyre supply quotes.",
  openGraph: {
    title: "Sign In – Okelcor",
    description:
      "Access your Okelcor account for wholesale pricing, order management, and tyre supply quotes.",
    url: "/auth",
    type: "website",
  },
  robots: {
    index: false,
    follow: false,
  },
};

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
