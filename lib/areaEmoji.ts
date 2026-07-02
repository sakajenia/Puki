/** Best-effort emoji for an area name, used in icon tiles across the app. */
export function areaEmoji(name: string): string {
  const n = name.toLowerCase();
  if (n.includes("kitchen") || n.includes("cucina")) return "🍳";
  if (n.includes("bed") || n.includes("camera")) return "🛏️";
  if (n.includes("bath") || n.includes("bagno")) return "🛁";
  if (n.includes("toilet") || n.includes("wc")) return "🚽";
  if (n.includes("living") || n.includes("soggiorno")) return "🛋️";
  if (n.includes("entrance") || n.includes("ingresso") || n.includes("hall")) return "🚪";
  if (n.includes("balcon") || n.includes("terra")) return "🪴";
  if (n.includes("office") || n.includes("studio")) return "🖥️";
  if (n.includes("garage")) return "🚗";
  if (n.includes("window") || n.includes("finestr")) return "🪟";
  return "✨";
}
