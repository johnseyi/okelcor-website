import type { Metadata } from "next";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import CheckoutFlow from "@/components/checkout/checkout-flow";

export const metadata: Metadata = {
  title: "Checkout – Okelcor",
  description: "Complete your tyre order with Okelcor.",
};

/**
 * Server-side session check — defence-in-depth layer.
 *
 * The middleware (middleware.ts) is the primary gate and redirects
 * unauthenticated users before this page renders. This check is a
 * fallback: if middleware is misconfigured or bypassed, the page
 * itself refuses to render checkout content without a valid session.
 *
 * On no session → redirect to /auth with callbackUrl=/checkout so
 * NextAuth returns the user here after a successful sign-in.
 */
export default async function CheckoutPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/auth?callbackUrl=/checkout");
  }

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
