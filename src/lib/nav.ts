export const PUBLIC_NAV = [
  { href: "/solutions", label: "Solutions" },
  { href: "/work", label: "Work" },
  { href: "/approach", label: "Approach" },
  { href: "/brief", label: "Brief" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
] as const;

export const PUBLIC_CTA = { href: "/start", label: "Start a project" } as const;

export const FOOTER_NAV = [
  ...PUBLIC_NAV,
  { href: "/start", label: "Start" },
] as const;
