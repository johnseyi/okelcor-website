import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign In – Okelcor",
  description: "Sign in or create an Okelcor account to access wholesale pricing, manage orders, and request tyre supply quotes.",
};

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
