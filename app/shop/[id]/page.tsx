import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import ShopBreadcrumb from "@/components/shop/shop-breadcrumb";
import ProductGallery from "@/components/shop/product-gallery";
import ProductInfo from "@/components/shop/product-info";
import ProductAccordion from "@/components/shop/product-accordion";
import RelatedProducts from "@/components/shop/related-products";
import { ALL_PRODUCTS, getProductById, getRelatedProducts } from "@/components/shop/data";
import { SITE_URL } from "@/lib/constants";
import ProductViewTracker from "@/components/shop/product-view-tracker";

type Props = { params: Promise<{ id: string }> };

export function generateStaticParams() {
  return ALL_PRODUCTS.map((p) => ({ id: String(p.id) }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const product = getProductById(Number(id));
  if (!product) return { title: "Product Not Found" };

  const title = `${product.brand} ${product.name} ${product.size}`;
  const description = `${product.description} Available for wholesale order. Global delivery from Okelcor.`;

  return {
    title,
    description,
    openGraph: {
      title: `${title} – Okelcor`,
      description,
      url: `/shop/${product.id}`,
      type: "website",
    },
    twitter: {
      title: `${title} – Okelcor`,
      description,
    },
  };
}

export default async function ProductDetailPage({ params }: Props) {
  const { id } = await params;
  const product = getProductById(Number(id));
  if (!product) notFound();

  const related = getRelatedProducts(product);

  const productSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: `${product.brand} ${product.name} ${product.size}`,
    description: product.description,
    sku: product.sku,
    brand: { "@type": "Brand", name: product.brand },
    image: product.image.startsWith("/") ? `${SITE_URL}${product.image}` : product.image,
    offers: {
      "@type": "Offer",
      priceCurrency: "EUR",
      price: product.price.toFixed(2),
      availability: "https://schema.org/InStock",
      seller: { "@type": "Organization", name: "Okelcor" },
      url: `${SITE_URL}/shop/${product.id}`,
    },
  };

  return (
    <main>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
      />
      <ProductViewTracker product={product} />
      <Navbar />

      <div className="w-full bg-[#f5f5f5] pt-[76px] lg:pt-20">
        {/* Breadcrumb */}
        <div className="tesla-shell py-4">
          <ShopBreadcrumb product={product} />
        </div>

        {/* Product layout */}
        <div className="tesla-shell pb-10 pt-2">
          <div className="grid gap-8 md:grid-cols-2 md:gap-12 lg:grid-cols-[1.05fr_0.95fr]">
            <ProductGallery product={product} />
            <ProductInfo product={product} />
          </div>
        </div>

        {/* Accordion */}
        <div className="tesla-shell pb-12">
          <ProductAccordion product={product} />
        </div>
      </div>

      {/* Related products */}
      <RelatedProducts products={related} />

      <Footer />
    </main>
  );
}
