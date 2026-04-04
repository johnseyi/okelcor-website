import Brands from "@/components/brands";
import FadeUp from "@/components/motion/fade-up";
import { apiFetch, type Brand, type ApiResponse } from "@/lib/api";

/** Async server component — fetches brands then renders the Brands client component. */
export default async function BrandsSection() {
  try {
    const res: ApiResponse<Brand[]> = await apiFetch<Brand[]>("/brands", {
      revalidate: 60,
      tags: ["brands"],
    });
    return (
      <FadeUp>
        <Brands brands={res.data?.length ? res.data : undefined} />
      </FadeUp>
    );
  } catch {
    return (
      <FadeUp>
        <Brands />
      </FadeUp>
    );
  }
}
