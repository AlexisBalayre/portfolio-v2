// app/[locale]/blog/[slug]/page.tsx
import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeftIcon, LanguageIcon } from "@heroicons/react/24/outline";
import { defaultLocale, getDictionary, localePath, locales, ogLocales, toLocale } from "~~/lib/i18n";
import { getPortfolio } from "~~/lib/portfolio";
import { formatPostDate, getAllPosts, getPost } from "~~/lib/posts";
import {
  authorName,
  blogUrl,
  feedTitle,
  feedUrl,
  languageAlternates,
  localeUrl,
  siteName,
  siteUrl,
  socialImage,
  twitterHandle,
} from "~~/lib/site";
import { buildBlogPosting, buildBreadcrumbs, serialiseStructuredData } from "~~/lib/structuredData";

interface PostPageProps {
  params: Promise<{ locale: string; slug: string }>;
}

// Only slugs from content/blog/ exist; anything else is a 404 at build time, not a runtime compile.
export const dynamicParams = false;

// Every English slug exists in every locale: a missing translation renders the English body with a notice.
// The parent layout's params are not handed down here, so the locale is enumerated too.
export async function generateStaticParams() {
  const posts = await getAllPosts(defaultLocale);
  return locales.flatMap(locale => posts.map(({ slug }) => ({ locale, slug })));
}

export async function generateMetadata({ params }: PostPageProps): Promise<Metadata> {
  const { locale: localeParam, slug } = await params;
  const locale = toLocale(localeParam);
  const { post } = await getPost(slug, locale);
  const images = [socialImage(locale, `/blog/${slug}/opengraph-image`, getDictionary(locale).og.postAlt)];

  return {
    title: post.title,
    description: post.description,
    alternates: {
      // A route that fell back to English is not an alternate of its own: its canonical is the English post.
      canonical: post.canonicalUrl,
      languages: languageAlternates(`/blog/${slug}`, post.locales),
      types: {
        "application/rss+xml": [{ url: feedUrl(locale), title: feedTitle(locale) }],
      },
    },
    openGraph: {
      type: "article",
      url: post.canonicalUrl,
      siteName,
      title: post.title,
      description: post.description,
      locale: ogLocales[post.contentLocale],
      alternateLocale: post.locales.filter(other => other !== post.contentLocale).map(other => ogLocales[other]),
      publishedTime: post.date,
      modifiedTime: post.date,
      authors: [siteUrl],
      tags: post.tags,
      images,
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.description,
      creator: twitterHandle,
      site: twitterHandle,
      images,
    },
  };
}

export default async function PostPage({ params }: PostPageProps) {
  const { locale: localeParam, slug } = await params;
  const locale = toLocale(localeParam);
  const t = getDictionary(locale);
  const { post, content } = await getPost(slug, locale);
  const relatedProjects = getPortfolio(locale).projects.filter(project => post.projects.includes(project.id));
  const structuredData = buildBlogPosting(
    {
      siteUrl,
      name: authorName,
      locale,
      blogUrl: blogUrl(locale),
      blogTitle: t.blog.title,
      blogDescription: t.blog.description,
    },
    post,
  );
  const breadcrumbs = buildBreadcrumbs([
    { name: authorName, url: localeUrl(locale) },
    { name: t.blog.title, url: blogUrl(locale) },
    // The canonical, so a French route that falls back to English points its trail at the English post.
    { name: post.title, url: post.canonicalUrl },
  ]);

  return (
    <div className="pt-10 mx-auto w-full mt-20">
      <div className="px-5">
        <article className="mx-auto container max-w-3xl" lang={post.contentLocale}>
          <header className="mb-10">
            <Link
              href={localePath(locale, "/blog")}
              className="inline-flex items-center gap-2 text-sm font-bold text-primary hover:text-primary-content"
            >
              <ArrowLeftIcon className="h-4 w-4" />
              {t.blog.allPosts}
            </Link>
            {post.contentLocale !== locale && (
              <p
                className="mt-6 flex items-center gap-2 rounded-lg bg-base-100 ring-offset-white ring-offset-1/2 ring-white/20 ring-1 px-4 py-3 text-sm"
                role="note"
              >
                <LanguageIcon className="h-4 w-4 shrink-0" />
                <span>
                  {t.blog.notTranslated}{" "}
                  <Link
                    href={localePath(post.contentLocale, `/blog/${post.slug}`)}
                    hrefLang={post.contentLocale}
                    className="font-bold text-primary hover:text-primary-content"
                  >
                    {t.blog.readInEnglish}
                  </Link>
                </span>
              </p>
            )}
            <p className="text-sm font-semibold text-neutral-content mt-6 mb-2">
              <time dateTime={post.date}>{formatPostDate(post.date, locale)}</time>
            </p>
            <h1 className="text-4xl md:text-5xl font-bold text-primary leading-tight">{post.title}</h1>
            <p className="text-lg text-neutral-content">{post.description}</p>
            <ul className="flex flex-wrap gap-2 list-none m-0 p-0" aria-label={t.blog.tags}>
              {post.tags.map(tag => (
                <li className="badge badge-outline badge-primary" key={tag}>
                  {tag}
                </li>
              ))}
            </ul>
          </header>

          {content}

          {relatedProjects.length > 0 && (
            <footer className="mt-12">
              <div className="divider divider-neutral"></div>
              <h2 className="text-2xl font-bold mb-4">{t.blog.relatedProjects}</h2>
              <ul className="list-disc pl-6 space-y-2 text-lg" aria-label={t.blog.relatedProjects}>
                {relatedProjects.map(project => (
                  <li key={project.id}>
                    <Link
                      href={`${localePath(locale)}#project-${project.id}`}
                      className="font-bold text-primary hover:text-primary-content"
                    >
                      {project.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </footer>
          )}
        </article>
      </div>
      {/* JSON-LD structured data */}
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: serialiseStructuredData(structuredData) }}
      />
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: serialiseStructuredData(breadcrumbs) }}
      />
    </div>
  );
}
