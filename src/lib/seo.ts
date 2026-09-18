import type { Metadata } from "next";
import {
  SITE_DESCRIPTION,
  SITE_NAME,
  SITE_TITLE,
  SITE_URL,
} from "@/lib/site";

export function pagePath(path: string): string {
  if (path === "/" || path === "") return `${SITE_URL}/`;
  return `${SITE_URL}${path}`;
}

export function publicMetadata({
  title,
  description,
  path,
  absoluteTitle = false,
}: {
  title: string;
  description: string;
  path: string;
  absoluteTitle?: boolean;
}): Metadata {
  const url = pagePath(path);
  const resolved = absoluteTitle ? title : `${title} — ${SITE_NAME}`;
  return {
    title: absoluteTitle ? { absolute: title } : title,
    description,
    alternates: { canonical: url },
    openGraph: {
      type: "website",
      url,
      siteName: SITE_NAME,
      title: resolved,
      description,
      images: [
        {
          url: "/synas-logo-sheet.png",
          width: 1024,
          height: 512,
          alt: SITE_NAME,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: resolved,
      description,
      images: ["/synas-logo-sheet.png"],
    },
  };
}

export const homeMetadata = publicMetadata({
  title: SITE_TITLE,
  description: SITE_DESCRIPTION,
  path: "/",
  absoluteTitle: true,
});
