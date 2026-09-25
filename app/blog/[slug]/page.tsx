// app/blog/[slug]/page.tsx
import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import { formatPostDate, getAllPosts, getPost } from "~~/lib/posts";
import {
  authorName,
  blogDescription,
  blogTitle,
  blogUrl,
  feedTitle,
  feedUrl,
  siteName,
  siteUrl,
  twitterHandle,
} from "~~/lib/site";
import { buildBlogPosting, serialiseStructuredData } from "~~/lib/structuredData";
import projects from "~~/public/assets/data/projects.json";

interface PostPageProps {
  params: Promise<{ slug: string }>;
}

// Only slugs from content/blog/ exist; anything else is a 404 at build time, not a runtime compile.
export const dynamicParams = false;

export async function generateStaticParams() {
  const posts = await getAllPosts();
  return posts.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: PostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const { post } = await getPost(slug);

  return {
    title: post.title,
    description: post.description,
    alternates: {
      canonical: post.url,
      types: {
        "application/rss+xml": [{ url: feedUrl, title: feedTitle }],
      },
    },
    openGraph: {
      type: "article",
      url: post.url,
      siteName,
      title: post.title,
      description: post.description,
      locale: "en_GB",
      publishedTime: post.date,
      modifiedTime: post.date,
      authors: [siteUrl],
      tags: post.tags,
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.description,
      creator: twitterHandle,
      site: twitterHandle,
    },
  };
}

export default async function PostPage({ params }: PostPageProps) {
  const { slug } = await params;
  const { post, content } = await getPost(slug);
  const relatedProjects = projects.filter(project => post.projects.includes(project.id));
  const structuredData = buildBlogPosting({ siteUrl, name: authorName, blogUrl, blogTitle, blogDescription }, post);

  return (
    <div className="pt-10 mx-auto w-full mt-20">
      <div className="px-5">
        <article className="mx-auto container max-w-3xl">
          <header className="mb-10">
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 text-sm font-bold text-primary hover:text-primary-content"
            >
              <ArrowLeftIcon className="h-4 w-4" />
              All posts
            </Link>
            <p className="text-sm font-semibold text-neutral-content mt-6 mb-2">
              <time dateTime={post.date}>{formatPostDate(post.date)}</time>
            </p>
            <h1 className="text-4xl md:text-5xl font-bold text-primary leading-tight">{post.title}</h1>
            <p className="text-lg text-neutral-content">{post.description}</p>
            <ul className="flex flex-wrap gap-2 list-none m-0 p-0" aria-label="Tags">
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
              <h2 className="text-2xl font-bold mb-4">Related projects</h2>
              <ul className="list-disc pl-6 space-y-2 text-lg" aria-label="Related projects">
                {relatedProjects.map(project => (
                  <li key={project.id}>
                    <Link
                      href={`/#project-${project.id}`}
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
    </div>
  );
}
