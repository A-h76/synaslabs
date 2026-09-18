"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useState } from "react";
import { PUBLIC_CTA, PUBLIC_NAV } from "@/lib/nav";
import { SiteContainer } from "@/components/site/primitives";
import { Wordmark } from "@/components/site/wordmark";

export function SiteHeader() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [openedFor, setOpenedFor] = useState(pathname);
  const open = menuOpen && openedFor === pathname;
  const menuId = useId();

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") setMenuOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  function toggleMenu() {
    if (openedFor !== pathname) {
      setOpenedFor(pathname);
      setMenuOpen(true);
      return;
    }
    setMenuOpen((value) => !value);
  }

  return (
    <header className="sticky top-0 z-40 border-b border-synas-ink/12 bg-synas-paper">
      <SiteContainer className="flex items-end justify-between gap-6 py-5 md:py-6">
        <Wordmark priority />
        <nav
          className="hidden items-baseline gap-7 lg:flex"
          aria-label="Primary"
        >
          {PUBLIC_NAV.map((item) => {
            const active =
              pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`font-mono text-[11px] tracking-[0.08em] uppercase ${
                  active
                    ? "text-synas-ink"
                    : "text-synas-ink/60 hover:text-synas-ink"
                }`}
                aria-current={active ? "page" : undefined}
              >
                {item.label}
              </Link>
            );
          })}
          <Link
            href={PUBLIC_CTA.href}
            className="font-mono text-[11px] tracking-[0.08em] uppercase text-synas-ink"
            aria-current={pathname === PUBLIC_CTA.href ? "page" : undefined}
          >
            {PUBLIC_CTA.label}
          </Link>
        </nav>
        <button
          type="button"
          className="min-h-11 font-mono text-[11px] tracking-[0.12em] uppercase lg:hidden"
          aria-expanded={open}
          aria-controls={menuId}
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={toggleMenu}
        >
          {open ? "Close" : "Menu"}
        </button>
      </SiteContainer>
      {open ? (
        <div
          id={menuId}
          className="border-t border-synas-ink/12 bg-synas-paper lg:hidden"
        >
          <SiteContainer className="flex flex-col py-4 pb-12">
            <nav aria-label="Primary">
              {[...PUBLIC_NAV, PUBLIC_CTA].map((item) => {
                const active =
                  pathname === item.href ||
                  pathname.startsWith(`${item.href}/`);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="flex min-h-12 items-center border-b border-synas-ink/10 font-sans text-2xl font-semibold tracking-tight"
                    aria-current={active ? "page" : undefined}
                    onClick={() => setMenuOpen(false)}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </SiteContainer>
        </div>
      ) : null}
    </header>
  );
}
