// app/[locale]/layout.tsx
import type { Metadata, Viewport } from "next";
import "~~/styles/globals.css";
import { Header } from "~~/components/Header";
import { Footer } from "~~/components/Footer";
import { defaultLocale, fill, getDictionary, locales, ogLocales, toLocale } from "~~/lib/i18n";
import { getPortfolio } from "~~/lib/portfolio";
import { getAllPosts } from "~~/lib/posts";
import {
  authorName,
  feedTitle,
  feedUrl,
  languageAlternates,
  localeUrl,
  siteName,
  siteUrl,
  socialImage,
  twitterHandle,
} from "~~/lib/site";
import { buildStructuredData, serialiseStructuredData } from "~~/lib/structuredData";

interface LocaleLayoutProps {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}

// Only en and fr are routes; the unprefixed English paths are rewrites to /en/** (next.config.js). Any other
// param, here or in a child segment, is refused at the router and answered with the prerendered app/not-found.tsx
// (a notFound() thrown at request time would be served as Next's bare error document instead, see that file).
export const dynamicParams = false;

export function generateStaticParams() {
  return locales.map(locale => ({ locale }));
}

export async function generateMetadata({ params }: LocaleLayoutProps): Promise<Metadata> {
  const locale = toLocale((await params).locale);
  const t = getDictionary(locale);
  const pageUrl = localeUrl(locale);
  const images = [socialImage(locale, "/opengraph-image", t.og.homeAlt)];

  return {
    metadataBase: new URL(siteUrl),
    title: {
      default: t.site.title,
      template: t.site.titleTemplate,
    },
    description: t.site.description,
    applicationName: siteName,
    authors: [{ name: authorName, url: siteUrl }],
    creator: authorName,
    publisher: authorName,
    generator: "Next.js",
    keywords: t.site.keywords,
    alternates: {
      canonical: pageUrl,
      languages: languageAlternates("/"),
      types: {
        "application/rss+xml": [{ url: feedUrl(locale), title: feedTitle(locale) }],
      },
    },
    openGraph: {
      type: "profile",
      firstName: "Alexis",
      lastName: "Balayre",
      url: pageUrl,
      siteName,
      title: t.site.title,
      description: t.site.socialDescription,
      locale: ogLocales[locale],
      alternateLocale: locales.filter(other => other !== locale).map(other => ogLocales[other]),
      images,
    },
    twitter: {
      card: "summary_large_image",
      title: t.site.title,
      description: t.site.socialDescription,
      creator: twitterHandle,
      site: twitterHandle,
      images,
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
}

export const viewport: Viewport = {
  themeColor: "#000000",
  colorScheme: "dark",
};

export default async function RootLayout({ children, params }: LocaleLayoutProps) {
  const locale = toLocale((await params).locale);
  const t = getDictionary(locale);
  const posts = await getAllPosts(locale);
  const postLocales = Object.fromEntries(posts.map(post => [post.slug, post.locales]));

  const profile = {
    siteUrl,
    pageUrl: localeUrl(locale),
    siteName,
    name: authorName,
    givenName: "Alexis",
    familyName: "Balayre",
    jobTitle: t.profile.jobTitle,
    description: t.profile.description,
    email: "alexis@balayre.com",
    imageUrl: `${siteUrl}/assets/img/alexis.jpg`,
    locality: "Paris",
    countryCode: "FR",
    nationality: "France",
    sameAs: ["https://github.com/AlexisBalayre", "https://www.linkedin.com/in/alexis-balayre"],
    knowsLanguage: ["fr", "en"],
    knowsAbout: t.profile.knowsAbout,
    projectsListName: fill(t.profile.projectsListName, { name: authorName }),
  };
  // Employers, degrees and awards are parsed from the English titles ("<role> at <organisation>");
  // only the projects list is taken from the locale's data.
  const data = { ...getPortfolio(defaultLocale), projects: getPortfolio(locale).projects };
  const structuredData = buildStructuredData(profile, data, locale);

  return (
    <html lang={locale}>
      <body className="flex flex-col min-h-screen">
        <Header locale={locale} postLocales={postLocales} />
        <main className="flex-1">{children}</main>
        <Footer locale={locale} />
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
