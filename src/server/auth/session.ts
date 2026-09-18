import "server-only";

import { createHmac, timingSafeEqual } from "node:crypto";
import { SESSION_COOKIE } from "@/lib/auth-cookie";
import { authSecret } from "@/lib/env";
import type { Actor } from "@/domain/entities";
import { USER_ROLES, type UserRole } from "@/domain/roles";

export { SESSION_COOKIE };

type SessionPayload = {
  sub: string;
  email: string;
  name: string;
  role: UserRole;
  companyId: string | null;
  exp: number;
};

function isRole(value: unknown): value is UserRole {
  return typeof value === "string" && USER_ROLES.includes(value as UserRole);
}

function sign(body: string, secret: string): string {
  return createHmac("sha256", secret).update(body).digest("base64url");
}

export function createSessionToken(actor: Actor, ttlSeconds = 60 * 60 * 12): string {
  const secret = authSecret();
  if (!secret) {
    throw new Error("AUTH_SECRET is not configured.");
  }
  const payload: SessionPayload = {
    sub: actor.id,
    email: actor.email,
    name: actor.name,
    role: actor.role,
    companyId: actor.companyId,
    exp: Math.floor(Date.now() / 1000) + ttlSeconds,
  };
  const body = Buffer.from(JSON.stringify(payload), "utf8").toString("base64url");
  return `${body}.${sign(body, secret)}`;
}

export function readSessionToken(token: string): Actor | null {
  const secret = authSecret();
  if (!secret) return null;
  const [body, signature] = token.split(".");
  if (!body || !signature) return null;
  const expected = sign(body, secret);
  const left = Buffer.from(signature);
  const right = Buffer.from(expected);
  if (left.length !== right.length || !timingSafeEqual(left, right)) {
    return null;
  }
  try {
    const payload = JSON.parse(
      Buffer.from(body, "base64url").toString("utf8"),
    ) as SessionPayload;
    if (!payload.sub || !payload.email || !isRole(payload.role)) return null;
    if (payload.exp < Math.floor(Date.now() / 1000)) return null;
    return {
      id: payload.sub,
      email: payload.email,
      name: payload.name,
      role: payload.role,
      companyId: payload.companyId ?? null,
    };
  } catch {
    return null;
  }
}
