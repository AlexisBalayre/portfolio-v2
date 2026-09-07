// app/layout.tsx
import type { Metadata } from "next";
import "~~/styles/globals.css";
import { Header } from "~~/components/Header";
import { Footer } from "~~/components/Footer";

const siteUrl = "https://alexis.balayre.com";
const siteName = "Alexis Balayre — AI Engineer";
const titleDefault = "Alexis Balayre — AI Engineer";
const titleTemplate = "%s | Alexis Balayre";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: titleDefault,
    template: titleTemplate,
  },
  description:
    "AI Engineer portfolio: real-time speech AI, LLM systems, agentic AI and production ML. Building Lia Live AI, Acolad's real-time AI interpreting platform. Projects in speech translation, LLMs, RAG, NLP and applied deep learning.",
  applicationName: siteName,
  authors: [{ name: "Alexis Balayre", url: siteUrl }],
  creator: "Alexis Balayre",
  publisher: "Alexis Balayre",
  generator: "Next.js",
  keywords: [
    "Alexis Balayre",
    "AI Engineer",
    "Real-Time Speech AI",
    "Speech Translation",
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
      en: `${siteUrl}/`,
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
    creator: "@alexisbalayre",
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
    inLanguage: "en-GB",
    author: { "@type": "Person", name: "Alexis Balayre", url: siteUrl },
  };

  const ldJsonPerson = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: "Alexis Balayre",
    url: siteUrl,
    image: `${siteUrl}/assets/img/alexis.jpg`,
    jobTitle: "AI Engineer",
    description:
      "AI Engineer specialising in real-time speech AI, LLM systems and production ML, with a background in Software Engineering and Data Science. Builds Lia Live AI, Acolad's real-time AI interpreting platform.",
    nationality: "French",
    address: { "@type": "PostalAddress", addressLocality: "Paris", addressCountry: "FR" },
    worksFor: { "@type": "Organization", name: "Acolad", url: "https://www.acolad.com/" },
    alumniOf: [
      { "@type": "CollegeOrUniversity", name: "Cranfield University", url: "https://www.cranfield.ac.uk/" },
      { "@type": "CollegeOrUniversity", name: "ISEP", url: "https://www.isep.fr/" },
    ],
    sameAs: ["https://github.com/AlexisBalayre", "https://www.linkedin.com/in/alexis-balayre"],
    knowsAbout: [
      "Real-Time Speech AI",
      "Speech Translation",
      "LLM Systems",
      "Generative AI",
      "Agentic AI",
      "Production ML",
      "Machine Learning",
      "LLM",
      "NLP",
      "Software Engineering",
      "AI Security",
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
