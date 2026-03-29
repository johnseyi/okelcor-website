import type { Metadata } from "next";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import NewsPageUI from "@/components/news/news-page-ui";

export const metadata: Metadata = {
  title: "News & Insights",
  description:
    "Insights, updates, and tyre supply knowledge for distributors, partners, and international buyers.",
  openGraph: {
    title: "News & Insights – Okelcor",
    description:
      "Tyre supply updates, market insights, and logistics knowledge for global distributors and buyers.",
    url: "/news",
    type: "website",
  },
  twitter: {
    title: "News & Insights – Okelcor",
    description:
      "Tyre supply updates and market insights for global distributors and buyers.",
  },
};

export default function NewsPage() {
  return (
    <main>
      <Navbar />
      <NewsPageUI />
      <Footer />
    </main>
  );
}
