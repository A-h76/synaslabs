import "server-only";

import { randomBytes, scrypt, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";

const scryptAsync = promisify(scrypt);

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString("hex");
  const derived = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${salt}:${derived.toString("hex")}`;
}

export async function verifyPassword(
  password: string,
  stored: string | null | undefined,
): Promise<boolean> {
  if (!stored || !stored.includes(":")) return false;
  const [salt, hex] = stored.split(":");
  if (!salt || !hex) return false;
  const derived = (await scryptAsync(password, salt, 64)) as Buffer;
  const left = Buffer.from(hex, "hex");
  if (left.length !== derived.length) return false;
  return timingSafeEqual(left, derived);
}
