// app/blog/page.tsx
import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { NewspaperIcon, RssIcon } from "@heroicons/react/24/outline";
import { formatPostDate, getAllPosts } from "~~/lib/posts";
import {
  authorName,
  blogDescription,
  blogTitle,
  blogUrl,
  feedUrl,
  siteName,
  siteUrl,
  twitterHandle,
} from "~~/lib/site";
import { buildBlog, serialiseStructuredData } from "~~/lib/structuredData";

const socialTitle = `${blogTitle} | ${authorName}`;

export const metadata: Metadata = {
  title: blogTitle,
  description: blogDescription,
  alternates: {
    canonical: blogUrl,
    types: {
      "application/rss+xml": [{ url: feedUrl, title: socialTitle }],
    },
  },
  openGraph: {
    type: "website",
    url: blogUrl,
    siteName,
    title: socialTitle,
    description: blogDescription,
    locale: "en_GB",
  },
  twitter: {
    card: "summary_large_image",
    title: socialTitle,
    description: blogDescription,
    creator: twitterHandle,
    site: twitterHandle,
  },
};

export default async function BlogPage() {
  const posts = await getAllPosts();
  const structuredData = buildBlog({ siteUrl, name: authorName, blogUrl, blogTitle, blogDescription }, posts);

  return (
    <div className="pt-10 mx-auto w-full mt-20">
      <div className="px-5">
        <section className="mx-auto container max-w-3xl scroll-mt-24" aria-labelledby="blog-heading">
          <span className="flex flex-row items-center justify-center md:justify-start mb-3">
            <NewspaperIcon className="h-8 w-8 mr-2 flex place-self-center" />
            <h1 id="blog-heading" className="text-4xl font-bold text-center md:text-left">
              {blogTitle}
            </h1>
          </span>
          <p className="text-lg text-neutral-content text-center md:text-left">{blogDescription}</p>
          <a
            href="/blog/rss.xml"
            className="inline-flex items-center gap-2 text-sm font-bold text-primary hover:text-primary-content"
            aria-label="RSS feed of the blog"
          >
            <RssIcon className="h-4 w-4" />
            Subscribe with RSS
          </a>

          <ul className="list-none m-0 p-0 mt-10 grid gap-8">
            {posts.map(post => (
              <li key={post.slug}>
                <article className="card bg-base-100 ring-offset-white ring-offset-1/2 ring-white/20 ring-1 shadow-xl">
                  <div className="card-body">
                    <time dateTime={post.date} className="text-sm font-semibold text-neutral-content">
                      {formatPostDate(post.date)}
                    </time>
                    <h2 className="card-title text-2xl">
                      <Link href={`/blog/${post.slug}`} className="hover:text-primary">
                        {post.title}
                      </Link>
                    </h2>
                    <p>{post.description}</p>
                    <ul className="card-actions list-none m-0 p-0" aria-label="Tags">
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
