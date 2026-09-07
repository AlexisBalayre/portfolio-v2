// app/layout.tsx
import type { Metadata, Viewport } from "next";
import "~~/styles/globals.css";
import { Header } from "~~/components/Header";
import { Footer } from "~~/components/Footer";
import { buildStructuredData, serialiseStructuredData } from "~~/lib/structuredData";
import experiences from "~~/public/assets/data/experiences.json";
import formation from "~~/public/assets/data/formation.json";
import hackathons from "~~/public/assets/data/hackathons.json";
import projects from "~~/public/assets/data/projects.json";
import tech from "~~/public/assets/data/tech.json";

const siteUrl = "https://alexis.balayre.com";
const siteName = "Alexis Balayre | AI Engineer";
const titleDefault = "Alexis Balayre | AI Engineer, Real-Time Speech AI";
const titleTemplate = "%s | Alexis Balayre";
const description =
  "AI Engineer in Paris building Lia Live AI, Acolad's real-time AI interpreting platform. Real-time speech AI, LLM systems, agentic AI and production ML.";
const socialDescription =
  "Portfolio of Alexis Balayre, AI Engineer specialising in real-time speech AI, LLM systems and production ML: experience, projects, skills and education.";

const profile = {
  siteUrl,
  siteName,
  name: "Alexis Balayre",
  givenName: "Alexis",
  familyName: "Balayre",
  jobTitle: "AI Engineer",
  description:
    "AI Engineer specialising in real-time speech AI, LLM systems and production ML, with a background in Software Engineering and Data Science. Builds Lia Live AI, Acolad's real-time AI interpreting platform.",
  email: "alexis@balayre.com",
  imageUrl: `${siteUrl}/assets/img/alexis.jpg`,
  locality: "Paris",
  countryCode: "FR",
  nationality: "French",
  sameAs: ["https://github.com/AlexisBalayre", "https://www.linkedin.com/in/alexis-balayre"],
  knowsLanguage: ["fr", "en"],
  knowsAbout: [
    "Real-Time Speech AI",
    "Speech Translation",
    "Automatic Speech Recognition",
    "Text-to-Speech",
    "LLM Systems",
    "Generative AI",
    "Agentic AI",
    "Retrieval-Augmented Generation",
    "Production ML",
    "Machine Learning",
    "NLP",
    "Software Engineering",
    "AI Security",
  ],
};

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: titleDefault,
    template: titleTemplate,
  },
  description,
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
    "AI Interpreting",
    "Lia Live AI",
    "Acolad",
    "Data Scientist",
    "Generative AI",
    "Agentic AI",
    "LLM",
    "RAG",
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
      "x-default": `${siteUrl}/`,
    },
  },
  openGraph: {
    type: "profile",
    firstName: "Alexis",
    lastName: "Balayre",
    url: siteUrl,
    siteName,
    title: titleDefault,
    description: socialDescription,
    locale: "en_GB",
  },
  twitter: {
    card: "summary_large_image",
    title: titleDefault,
    description: socialDescription,
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

export const viewport: Viewport = {
  themeColor: "#000000",
  colorScheme: "dark",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const structuredData = buildStructuredData(profile, { experiences, formation, hackathons, projects, tech });

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
          dangerouslySetInnerHTML={{ __html: serialiseStructuredData(structuredData) }}
        />
      </body>
    </html>
  );
}
