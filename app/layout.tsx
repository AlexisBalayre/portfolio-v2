// app/layout.tsx
import type { Metadata } from "next";
import "~~/styles/globals.css";
import Header from "~~/components/Header";
import { Footer } from "~~/components/Footer";

const siteUrl = "https://alexis.balayre.com";
const siteName = "Alexis Balayre — AI Engineer";
const titleDefault = "AI Engineer";
const titleTemplate = "%s | Alexis Balayre";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: titleDefault,
    template: titleTemplate,
  },
  description:
    "AI Engineer portfolio — Software Engineering, Data Science, Generative AI & Agentic Systems. Projects in LLMs, NLP, multimodal AI, and production-grade ML.",
  applicationName: siteName,
  authors: [{ name: "Alexis Balayre", url: siteUrl }],
  creator: "Alexis Balayre",
  publisher: "Alexis Balayre",
  generator: "Next.js",
  keywords: [
    "Alexis Balayre",
    "AI Engineer",
    "Data Scientist",
    "Generative AI",
    "Agentic AI",
    "LLM",
    "NLP",
    "Machine Learning",
    "Software Engineering",
    "Paris",
    "ISEP",
    "Cranfield University",
  ],
  alternates: {
    canonical: siteUrl,
    languages: {
      "en": `${siteUrl}/`,
    },
  },
  openGraph: {
    type: "website",
    url: siteUrl,
    siteName,
    title: siteName,
    description:
      "Explore Alexis Balayre’s work at the forefront of Agentic AI, Generative AI, and applied Data Science.",
    images: [
      {
        url: "/preview.png",
        width: 1200,
        height: 630,
        alt: "Alexis Balayre — AI Engineer",
      },
    ],
    locale: "en_GB",
  },
  twitter: {
    card: "summary_large_image",
    title: siteName,
    description:
      "Explore Alexis Balayre’s work at the forefront of Agentic AI, Generative AI, and applied Data Science.",
    images: ["/preview.png"],
    creator: "@alexisbalayre", // change if you use another handle or remove
    site: "@alexisbalayre",
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-video-preview": -1,
      "max-snippet": -1,
    },
  },
  category: "technology",
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
  manifest: "/site.webmanifest",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const ldJsonWebsite = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: siteName,
    url: siteUrl,
    potentialAction: {
      "@type": "SearchAction",
      target: `${siteUrl}/search?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };

  const ldJsonPerson = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: "Alexis Balayre",
    url: siteUrl,
    jobTitle: "AI Engineer",
    sameAs: [
      "https://github.com/AlexisBalayre",
      "https://www.linkedin.com/in/alexis-balayre", // adjust if needed
    ],
    worksFor: {
      "@type": "Organization",
      name: "Independent / Open to opportunities",
    },
    knowsAbout: [
      "Machine Learning",
      "Generative AI",
      "Agentic AI",
      "LLM",
      "NLP",
      "Software Engineering",
    ],
  };

  return (
    <html lang="en">
      <body className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
        {/* JSON-LD structured data */}
        <script
          type="application/ld+json"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: JSON.stringify(ldJsonWebsite) }}
        />
        <script
          type="application/ld+json"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: JSON.stringify(ldJsonPerson) }}
        />
      </body>
    </html>
  );
}
