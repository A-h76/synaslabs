export function toStateCode(value: string, fallback: string): string {
  const code = value
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, "_")
    .replace(/^_|_$/g, "")
    .slice(0, 40);
  return code || fallback;
}
