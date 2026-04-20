export function getProductImageUrl(imagePath: string | null | undefined): string {
  if (!imagePath) return "/images/tyre-placeholder.png";
  if (imagePath.startsWith("http")) return imagePath;
  // Strip any leading storage/ so we never get storage/storage/products/...
  const cleanPath = imagePath.replace(/^storage\//, "");
  return `https://api.takeovercreatives.com/storage/${cleanPath}`;
}
