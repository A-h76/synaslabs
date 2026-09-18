import "server-only";

import { cache } from "react";
import { cookies } from "next/headers";
import { eq } from "drizzle-orm";
import type { Actor } from "@/domain/entities";
import { USER_ROLES, type UserRole } from "@/domain/roles";
import { isAuthConfigured } from "@/lib/env";
import { getDb } from "@/server/db/client";
import { users } from "@/server/db/schema";
import { readSessionToken, SESSION_COOKIE } from "@/server/auth/session";

function isRole(value: unknown): value is UserRole {
  return typeof value === "string" && USER_ROLES.includes(value as UserRole);
}

export const getCurrentActor = cache(async (): Promise<Actor | null> => {
  if (!isAuthConfigured()) return null;
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  const session = readSessionToken(token);
  if (!session) return null;
  try {
    const db = getDb();
    if (!db) return null;
    const [row] = await db
      .select({
        id: users.id,
        email: users.email,
        name: users.name,
        role: users.role,
        companyId: users.companyId,
      })
      .from(users)
      .where(eq(users.id, session.id))
      .limit(1);
    if (!row || !isRole(row.role)) return null;
    return {
      id: row.id,
      email: row.email,
      name: row.name,
      role: row.role,
      companyId: row.companyId ?? null,
    };
  } catch {
    return null;
  }
});