import type { Metadata } from "next";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import CheckoutFlow from "@/components/checkout/checkout-flow";

export const metadata: Metadata = {
  title: "Checkout – Okelcor",
  description: "Complete your tyre order with Okelcor.",
};

export default function CheckoutPage() {
  return (
    <main>
      <Navbar />
      <div className="min-h-screen w-full bg-[#f5f5f5] pt-[76px] lg:pt-20">
        <CheckoutFlow />
      </div>
      <Footer />
    </main>
  );
}
