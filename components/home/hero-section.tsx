import Hero from "@/components/hero";
import { apiFetch, type HeroSlide, type ApiResponse } from "@/lib/api";
import { getServerLocale } from "@/lib/locale";

/** Async server component — fetches hero slides then renders the Hero client component. */
export default async function HeroSection() {
  const locale = await getServerLocale();
  try {
    const res: ApiResponse<HeroSlide[]> = await apiFetch<HeroSlide[]>(
      "/hero-slides",
      { locale, revalidate: 60, tags: ["hero-slides", `hero-slides-${locale}`] }
    );
    return <Hero slides={res.data?.length ? res.data : undefined} />;
  } catch {
    return <Hero />;
  }
}
