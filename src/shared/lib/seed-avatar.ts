const DICEBEAR_STYLE = "notionists";

/** Deterministic, Notion-style avatar image generated from a stable per-person seed (id). */
export function getSeedAvatarUrl(seed: string): string {
  return `https://api.dicebear.com/9.x/${DICEBEAR_STYLE}/svg?seed=${encodeURIComponent(seed)}`;
}
