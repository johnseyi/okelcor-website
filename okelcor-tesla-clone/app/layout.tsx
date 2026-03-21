import type { Metadata } from "next";
import "./globals.css";
import { CartProvider } from "@/context/cart-context";
import CartDrawer from "@/components/cart/cart-drawer";

export const metadata: Metadata = {
  title: "Okelcor – Growing Together",
  description: "Premium tyre sourcing solutions for distributors and wholesalers.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <CartProvider>
          {children}
          <CartDrawer />
        </CartProvider>
      </body>
    </html>
  );
}