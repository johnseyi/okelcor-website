import Categories from "@/components/categories";
import FadeUp from "@/components/motion/fade-up";
import { apiFetch, type Category, type ApiResponse } from "@/lib/api";
import { getServerLocale } from "@/lib/locale";

/** Async server component — fetches categories then renders the Categories client component. */
export default async function CategoriesSection() {
  const locale = await getServerLocale();
  try {
    const res: ApiResponse<Category[]> = await apiFetch<Category[]>(
      "/categories",
      { locale, revalidate: 60, tags: ["categories", `categories-${locale}`] }
    );
    return (
      <FadeUp>
        <Categories categories={res.data?.length ? res.data : undefined} />
      </FadeUp>
    );
  } catch {
    return (
      <FadeUp>
        <Categories />
      </FadeUp>
    );
  }
}
