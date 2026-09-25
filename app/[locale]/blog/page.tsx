// app/[locale]/blog/page.tsx
import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { LanguageIcon, NewspaperIcon, RssIcon } from "@heroicons/react/24/outline";
import { getDictionary, localePath, locales, ogLocales, toLocale } from "~~/lib/i18n";
import { formatPostDate, getAllPosts } from "~~/lib/posts";
import {
  authorName,
  blogUrl,
  feedTitle,
  feedUrl,
  languageAlternates,
  siteName,
  siteUrl,
  twitterHandle,
} from "~~/lib/site";
import { buildBlog, serialiseStructuredData } from "~~/lib/structuredData";

interface BlogPageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: BlogPageProps): Promise<Metadata> {
  const locale = toLocale((await params).locale);
  const t = getDictionary(locale);

  return {
    title: t.blog.title,
    description: t.blog.description,
    alternates: {
      canonical: blogUrl(locale),
      languages: languageAlternates("/blog"),
      types: {
        "application/rss+xml": [{ url: feedUrl(locale), title: feedTitle(locale) }],
      },
    },
    openGraph: {
      type: "website",
      url: blogUrl(locale),
      siteName,
      title: feedTitle(locale),
      description: t.blog.description,
      locale: ogLocales[locale],
      alternateLocale: locales.filter(other => other !== locale).map(other => ogLocales[other]),
    },
    twitter: {
      card: "summary_large_image",
      title: feedTitle(locale),
      description: t.blog.description,
      creator: twitterHandle,
      site: twitterHandle,
    },
  };
}

export default async function BlogPage({ params }: BlogPageProps) {
  const locale = toLocale((await params).locale);
  const t = getDictionary(locale);
  const posts = await getAllPosts(locale);
  const structuredData = buildBlog(
    {
      siteUrl,
      name: authorName,
      locale,
      blogUrl: blogUrl(locale),
      blogTitle: t.blog.title,
      blogDescription: t.blog.description,
    },
    posts,
  );

  return (
    <div className="pt-10 mx-auto w-full mt-20">
      <div className="px-5">
        <section className="mx-auto container max-w-3xl scroll-mt-24" aria-labelledby="blog-heading">
          <span className="flex flex-row items-center justify-center md:justify-start mb-3">
            <NewspaperIcon className="h-8 w-8 mr-2 flex place-self-center" />
            <h1 id="blog-heading" className="text-4xl font-bold text-center md:text-left">
              {t.blog.title}
            </h1>
          </span>
          <p className="text-lg text-neutral-content text-center md:text-left">{t.blog.description}</p>
          <a
            href={localePath(locale, "/blog/rss.xml")}
            className="inline-flex items-center gap-2 text-sm font-bold text-primary hover:text-primary-content"
            aria-label={t.blog.feedAria}
          >
            <RssIcon className="h-4 w-4" />
            {t.blog.subscribe}
          </a>

          <ul className="list-none m-0 p-0 mt-10 grid gap-8">
            {posts.map(post => (
              <li key={post.slug}>
                <article className="card bg-base-100 ring-offset-white ring-offset-1/2 ring-white/20 ring-1 shadow-xl">
                  <div className="card-body">
                    <time dateTime={post.date} className="text-sm font-semibold text-neutral-content">
                      {formatPostDate(post.date, locale)}
                    </time>
                    <h2 className="card-title text-2xl">
                      <Link href={localePath(locale, `/blog/${post.slug}`)} className="hover:text-primary">
                        {post.title}
                      </Link>
                    </h2>
                    <p>{post.description}</p>
                    {post.contentLocale !== locale && (
                      <p className="text-sm text-neutral-content flex items-center gap-2">
                        <LanguageIcon className="h-4 w-4" />
                        {t.blog.notTranslated}{" "}
                        <Link
                          href={localePath(post.contentLocale, `/blog/${post.slug}`)}
                          hrefLang={post.contentLocale}
                          className="font-bold text-primary hover:text-primary-content"
                        >
                          {t.blog.readInEnglish}
                        </Link>
                      </p>
                    )}
                    <ul className="card-actions list-none m-0 p-0" aria-label={t.blog.tags}>
                      {post.tags.map(tag => (
                        <li className="badge badge-outline badge-primary" key={tag}>
                          {tag}
                        </li>
                      ))}
                    </ul>
                  </div>
                </article>
              </li>
            ))}
          </ul>
        </section>
      </div>
      {/* JSON-LD structured data */}
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: serialiseStructuredData(structuredData) }}
      />
    </div>
  );
}
