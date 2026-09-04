import BrandRow from "@/components/home/brand-row";
import { apiFetch, type Brand, type ApiResponse } from "@/lib/api";

/** Async server component — fetches the live brand list for the logo strip. */
export default async function BrandsSection() {
  try {
    const res: ApiResponse<Brand[]> = await apiFetch<Brand[]>("/brands", {
      revalidate: 60,
      tags: ["brands"],
    });
    return <BrandRow brands={res.data?.length ? res.data : undefined} />;
  } catch {
    return null;
  }
}
