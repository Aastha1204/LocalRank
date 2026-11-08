import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { ANALYTICS_ID, CONTACT, OWNER } from "@/config/site";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });

const title = `${OWNER.brand} | AI Chatbots, WhatsApp Automation & Websites in Mumbai`;
const description =
  "AI chatbots, WhatsApp follow-up automation and websites for clinics, coaching classes, real estate, CAs and more in Mumbai, Kalyan, Dombivli and Thane. See live demos and get a free demo for your business.";

export const metadata: Metadata = {
  metadataBase: new URL(OWNER.siteUrl),
  title,
  description,
  alternates: { canonical: "/" },
  openGraph: {
    title,
    description,
    url: OWNER.siteUrl,
    siteName: OWNER.brand,
    type: "website",
    locale: "en_IN",
    images: [{ url: "/og.jpg", width: 1200, height: 630, alt: "Live demo screenshots of AI chatbot, WhatsApp follow-up and clinic website" }],
  },
  twitter: { card: "summary_large_image", title, description, images: ["/og.jpg"] },
};

export const viewport: Viewport = { themeColor: "#1F2340", width: "device-width", initialScale: 1 };

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "ProfessionalService",
  name: `${OWNER.brand} - AI & Web Services`,
  description,
  url: OWNER.siteUrl,
  image: `${OWNER.siteUrl}/og.jpg`,
  telephone: CONTACT.phone,
  email: CONTACT.email,
  address: { "@type": "PostalAddress", addressLocality: "Mumbai", addressRegion: "Maharashtra", addressCountry: "IN" },
  areaServed: ["Mumbai", "Kalyan", "Dombivli", "Thane"],
  founder: { "@type": "Person", name: OWNER.name },
  priceRange: "₹₹",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-IN" className={inter.variable}>
      <body>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
        {children}
        {ANALYTICS_ID && <Script defer data-domain={ANALYTICS_ID} src="https://plausible.io/js/script.js" strategy="afterInteractive" />}
      </body>
    </html>
  );
}
