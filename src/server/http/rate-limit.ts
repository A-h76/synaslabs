import "server-only";

import { headers } from "next/headers";

type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();

function prune(now: number): void {
  if (buckets.size < 500) return;
  for (const [key, bucket] of buckets) {
    if (bucket.resetAt < now) buckets.delete(key);
  }
}

export function rateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  prune(now);
  const current = buckets.get(key);
  if (!current || current.resetAt < now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }
  if (current.count >= limit) return false;
  current.count += 1;
  return true;
}

export async function clientKey(prefix: string): Promise<string> {
  const headerList = await headers();
  const forwarded = headerList.get("x-forwarded-for")?.split(",")[0]?.trim();
  const real = headerList.get("x-real-ip")?.trim();
  return `${prefix}:${forwarded || real || "unknown"}`;
}

export async function interpretRateOk(): Promise<boolean> {
  return rateLimit(await clientKey("brief"), 8, 10 * 60 * 1000);
}

export async function inquiryRateOk(): Promise<boolean> {
  return rateLimit(await clientKey("inquiry"), 5, 15 * 60 * 1000);
}
