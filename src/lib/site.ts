export const SITE_URL = "https://synaslabs.com";
export const SITE_HOST = "synaslabs.com";
export const SITE_TITLE = "Synas Labs — Systems that move businesses";
export const SITE_DESCRIPTION =
  "Synas Labs studies how work moves through a business, then designs the software, automation, and connections around it.";
export const SITE_NAME = "Synas Labs";
export const SITE_EMAIL = "hello@synaslabs.com";
export const BRAND_STATEMENT = "Systems that move businesses.";
export const LINKEDIN_URL = "https://www.linkedin.com/company/synas-labs";

/** Last public homepage content change. Keep sitemap static to avoid runtime Date issues. */
export const SITE_UPDATED_AT = "2026-09-18";

export const ORGANIZATION_JSON_LD = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: SITE_NAME,
  url: `${SITE_URL}/`,
  logo: `${SITE_URL}/icon.png`,
  email: SITE_EMAIL,
  description: SITE_DESCRIPTION,
  sameAs: [LINKEDIN_URL],
  contactPoint: {
    "@type": "ContactPoint",
    email: SITE_EMAIL,
    contactType: "sales",
  },
} as const;

export const WEBSITE_JSON_LD = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: SITE_NAME,
  url: `${SITE_URL}/`,
  description: SITE_DESCRIPTION,
  publisher: { "@type": "Organization", name: SITE_NAME },
} as const;
