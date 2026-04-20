const API_BASE = "https://api.takeovercreatives.com";

export function getProductImageUrl(imagePath: string | null | undefined): string {
  if (!imagePath) return "/images/tyre-placeholder.png";
  if (imagePath.startsWith("http")) return imagePath;
  // Relative path from API — strip leading slash to avoid double-slash
  const clean = imagePath.startsWith("/") ? imagePath.slice(1) : imagePath;
  return `${API_BASE}/${clean}`;
}
