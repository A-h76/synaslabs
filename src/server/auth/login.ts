"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { count } from "drizzle-orm";
import type { Actor } from "@/domain/entities";
import { USER_ROLES, type UserRole } from "@/domain/roles";
import {
  authSecret,
  bootstrapAdminEmail,
  bootstrapAdminPassword,
  isAuthConfigured,
} from "@/lib/env";
import { getDb } from "@/server/db/client";
import { users } from "@/server/db/schema";
import { hashPassword, verifyPassword } from "@/server/auth/password";
import { createSessionToken, SESSION_COOKIE } from "@/server/auth/session";

export type LoginState = {
  ok: boolean;
  error?: string;
};

function safeNext(value: string | null | undefined): string {
  if (!value) return "/admin";
  if (!value.startsWith("/")) return "/admin";
  if (value.startsWith("//")) return "/admin";
  if (value.startsWith("/login")) return "/admin";
  return value;
}

function isRole(value: string): value is UserRole {
  return USER_ROLES.includes(value as UserRole);
}

async function setSession(actor: Actor): Promise<void> {
  const token = createSessionToken(actor);
  const jar = await cookies();
  jar.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 12,
  });
}

export async function loginAction(
  _prev: LoginState,
  formData: FormData,
): Promise<LoginState> {
  if (!isAuthConfigured() || !authSecret()) {
    return { ok: false, error: "Authentication is not configured." };
  }

  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  const password = String(formData.get("password") ?? "");
  const next = safeNext(String(formData.get("next") ?? "/admin"));

  if (!email || password.length < 8) {
    return { ok: false, error: "Email and a password of 8 or more characters are required." };
  }

  const db = getDb();
  if (!db) {
    return { ok: false, error: "The data store is not connected." };
  }

  const existing = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);
  let row = existing[0];

  if (!row) {
    const [{ value: userCount }] = await db.select({ value: count() }).from(users);
    const bootstrapEmail = bootstrapAdminEmail();
    const bootstrapPassword = bootstrapAdminPassword();
    if (
      userCount === 0 &&
      bootstrapEmail &&
      bootstrapPassword &&
      email === bootstrapEmail &&
      password === bootstrapPassword
    ) {
      const [created] = await db
        .insert(users)
        .values({
          email,
          name: "Synas admin",
          role: "ADMIN",
          passwordHash: await hashPassword(password),
          lastLoginAt: new Date(),
        })
        .returning();
      row = created;
    }
  }

  if (!row?.passwordHash || !(await verifyPassword(password, row.passwordHash))) {
    return { ok: false, error: "Those credentials were not accepted." };
  }

  if (!isRole(row.role)) {
    return { ok: false, error: "Those credentials were not accepted." };
  }

  await db
    .update(users)
    .set({ lastLoginAt: new Date(), updatedAt: new Date() })
    .where(eq(users.id, row.id));

  await setSession({
    id: row.id,
    email: row.email,
    name: row.name,
    role: row.role,
    companyId: row.companyId ?? null,
  });

  redirect(row.role === "CLIENT" ? (next.startsWith("/portal") ? next : "/portal") : next);
}

export async function logoutAction(): Promise<void> {
  const jar = await cookies();
  jar.delete(SESSION_COOKIE);
  redirect("/login");
}
