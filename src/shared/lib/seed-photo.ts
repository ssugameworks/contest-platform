/** Deterministic mock photo URL generated from a stable seed (Lorem Picsum). */
export function getSeedPhotoUrl(
  seed: string,
  width = 640,
  height = 480,
): string {
  return `https://picsum.photos/seed/${encodeURIComponent(seed)}/${width}/${height}`;
}
