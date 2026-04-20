// Base URL for API-served static files — strip /api/v1 suffix to get storage root
const API_STORAGE_BASE = (
  process.env.NEXT_PUBLIC_API_URL ?? "https://api.takeovercreatives.com/api/v1"
).replace("/api/v1", "");

export function getProductImageUrl(imagePath: string | null | undefined): string {
  if (!imagePath) return "/images/tyre-placeholder.png";
  if (imagePath.startsWith("http")) return imagePath;
  const clean = imagePath.startsWith("/") ? imagePath.slice(1) : imagePath;
  return `${API_STORAGE_BASE}/${clean}`;
}
