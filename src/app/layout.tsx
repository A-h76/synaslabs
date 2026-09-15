import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const siteUrl = "https://synaslabs.com";
const siteTitle = "Synas Labs — AI Automation, CRM & Business Software";
const siteDescription =
  "Synas Labs builds AI automation, CRM systems, and business software that turn manual business workflows into connected systems.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: siteTitle,
  description: siteDescription,
  applicationName: "Synas Labs",
  authors: [{ name: "Synas Labs" }],
  keywords: [
    "Synas Labs",
    "AI automation",
    "CRM",
    "business software",
    "operating layer",
  ],
  // Canonical rendered in <head> to keep trailing slash on the root URL.
  openGraph: {
    type: "website",
    url: `${siteUrl}/`,
    siteName: "Synas Labs",
    title: siteTitle,
    description: siteDescription,
    images: [
      {
        url: "/synas-logo-sheet.png",
        width: 1024,
        height: 512,
        alt: "Synas Labs",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: siteTitle,
    description: siteDescription,
    images: ["/synas-logo-sheet.png"],
  },
  icons: {
    icon: [{ url: "/icon.png", type: "image/png" }],
    apple: [{ url: "/apple-touch-icon.png" }],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  themeColor: "#02d89c",
  colorScheme: "light",
  width: "device-width",
  initialScale: 1,
};

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Synas Labs",
  url: `${siteUrl}/`,
  logo: `${siteUrl}/synas-mark.png`,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <link rel="canonical" href={`${siteUrl}/`} />
      </head>
      <body className="min-h-full">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationJsonLd),
          }}
        />
        {children}
      </body>
    </html>
  );
}
