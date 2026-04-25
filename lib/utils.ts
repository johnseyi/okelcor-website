// Derive the API origin from the env var so storage URLs use the same domain
// e.g. https://api.okelcor.com/api/v1  →  https://api.okelcor.com
const API_ORIGIN = (
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/v1"
).replace(/\/api\/v\d+\/?$/, "").replace(/\/+$/, "");

export function getProductImageUrl(imagePath: string | null | undefined): string {
  if (!imagePath) return "/images/tyre-placeholder.png";
  if (imagePath.startsWith("http")) return imagePath;
  // Strip any leading slashes or storage/ prefix so we never get storage/storage/...
  const cleanPath = imagePath.replace(/^\/+/, "").replace(/^storage\//, "");
  return `${API_ORIGIN}/storage/${cleanPath}`;
}
