"use client";

import { useActionState } from "react";
import { loginAction, type LoginState } from "@/server/auth/login";

const initial: LoginState = { ok: false };

export function LoginForm({ next }: { next: string }) {
  const [state, action, pending] = useActionState(loginAction, initial);
  return (
    <form action={action} className="mt-10 flex max-w-md flex-col gap-8">
      <input type="hidden" name="next" value={next} />
      <label>
        <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-synas-ink/55">
          Email
        </span>
        <input
          className="site-field mt-2"
          type="email"
          name="email"
          autoComplete="username"
          required
        />
      </label>
      <label>
        <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-synas-ink/55">
          Password
        </span>
        <input
          className="site-field mt-2"
          type="password"
          name="password"
          autoComplete="current-password"
          required
          minLength={8}
        />
      </label>
      {state.error ? (
        <p className="text-sm text-[#8a1f1f]" role="alert">
          {state.error}
        </p>
      ) : null}
      <button type="submit" disabled={pending} className="site-action self-start">
        {pending ? "Checking…" : "Sign in →"}
      </button>
    </form>
  );
}
