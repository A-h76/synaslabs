import { parsePublicBrief } from "@/domain/workflow/public-brief";
import type { PublicBrief } from "@/domain/workflow/public-brief";

export const BRIEF_STORAGE_KEY = "synas.systemBrief.v1";

let snapshot: { raw: string | null; value: PublicBrief | null } = {
  raw: null,
  value: null,
};

const listeners = new Set<() => void>();

function notify(): void {
  listeners.forEach((listener) => listener());
}

function parse(raw: string | null): PublicBrief | null {
  if (raw === snapshot.raw) return snapshot.value;
  snapshot = {
    raw,
    value: raw ? parsePublicBrief(JSON.parse(raw)) : null,
  };
  return snapshot.value;
}

export function subscribeStoredBrief(onStoreChange: () => void): () => void {
  listeners.add(onStoreChange);
  function onStorage(event: StorageEvent) {
    if (event.key === BRIEF_STORAGE_KEY || event.key === null) {
      onStoreChange();
    }
  }
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(onStoreChange);
    window.removeEventListener("storage", onStorage);
  };
}

export function readStoredBrief(): PublicBrief | null {
  if (typeof window === "undefined") return null;
  try {
    return parse(window.sessionStorage.getItem(BRIEF_STORAGE_KEY));
  } catch {
    snapshot = { raw: null, value: null };
    return null;
  }
}

export function writeStoredBrief(brief: PublicBrief): void {
  const raw = JSON.stringify(brief);
  window.sessionStorage.setItem(BRIEF_STORAGE_KEY, raw);
  snapshot = { raw, value: brief };
  notify();
}

export function clearStoredBrief(): void {
  window.sessionStorage.removeItem(BRIEF_STORAGE_KEY);
  snapshot = { raw: null, value: null };
  notify();
}
