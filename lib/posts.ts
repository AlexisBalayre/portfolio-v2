// lib/posts.ts
import { cache } from "react";
import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";
import { compileMDX } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import { mdxComponents } from "~~/mdx-components";
import { defaultLocale, isLocale, languageTags, locales, type Locale } from "~~/lib/i18n";
import { getPortfolio } from "~~/lib/portfolio";
import { postUrl, publishTimeZone } from "~~/lib/site";

export interface PostFrontmatter {
  title: string;
  description: string;
  date: string;
  tags: string[];
  projects: string[];
  // Same-day ordering: a higher value lists first. Omitted means 0; posts on different days ignore it.
  order: number;
}

export interface Post extends PostFrontmatter {
  slug: string;
  // The locale of the route the post was read for, and the locale its body is actually written in:
  // they differ when a French route falls back to the English file.
  locale: Locale;
  contentLocale: Locale;
  url: string;
  // The URL of the body's own locale; equals url unless the post fell back.
  canonicalUrl: string;
  // Locales with a file of their own; en is always present.
  locales: Locale[];
}

const postsDir = join(process.cwd(), "content/blog");
// <slug>.mdx is the English source; <slug>.fr.mdx is its optional French version.
const POST_FILE = /^([a-z0-9]+(?:-[a-z0-9]+)*)(?:\.([a-z]{2}))?\.mdx$/;
const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
const projectIds = new Set(getPortfolio(defaultLocale).projects.map(project => project.id));

// Vercel sets VERCEL_ENV to "production", "preview" or "development"; yarn dev leaves it unset. Only the production
// build hides the posts dated after today, so a preview deployment and the dev server show a scheduled post at its
// final URL for proofreading. Documented in docs/conventions/content.md, "Scheduled posts".
const includesScheduledPosts = process.env.VERCEL_ENV !== "production";

// Today as YYYY-MM-DD in the site's time zone, comparable with the frontmatter date as a string.
const todayInPublishTimeZone = (): string => {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: publishTimeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());
  const part = (type: Intl.DateTimeFormatPartTypes) => parts.find(entry => entry.type === type)?.value;
  return `${part("year")}-${part("month")}-${part("day")}`;
};

// A post is published from its date. The production build leaves the others out everywhere getAllPosts feeds
// (listing, feeds, sitemap, static params, project cards), so their URLs are 404s until the deployment of that
// morning, which .github/workflows/scheduled-publish.yaml triggers daily.
const today = todayInPublishTimeZone();
const isPublished = (post: Post): boolean => includesScheduledPosts || post.date <= today;

const postFile = (slug: string, locale: Locale): string =>
  locale === defaultLocale ? `${slug}.mdx` : `${slug}.${locale}.mdx`;

const isStringList = (value: unknown): value is string[] =>
  Array.isArray(value) && value.every(entry => typeof entry === "string" && entry.trim() !== "");

// Frontmatter is untyped YAML: a missing or malformed field must fail the build, not ship a broken post.
const validateFrontmatter = (file: string, frontmatter: Record<string, unknown>): PostFrontmatter => {
  const { title, description, date, tags, projects: related, order = 0 } = frontmatter;

  if (typeof title !== "string" || title.trim() === "") throw new Error(`${file}: "title" must be a non-empty string`);
  if (typeof description !== "string" || description.trim() === "") {
    throw new Error(`${file}: "description" must be a non-empty string`);
  }
  // Date.parse rolls 2026-02-30 over to March; the round trip catches that.
  if (
    typeof date !== "string" ||
    !ISO_DATE.test(date) ||
    Number.isNaN(Date.parse(date)) ||
    new Date(date).toISOString().slice(0, 10) !== date
  ) {
    throw new Error(`${file}: "date" must be a YYYY-MM-DD string`);
  }
  if (!isStringList(tags) || tags.length === 0) throw new Error(`${file}: "tags" must be a non-empty list of strings`);
  if (!isStringList(related)) throw new Error(`${file}: "projects" must be a list of project ids`);
  if (typeof order !== "number" || !Number.isInteger(order) || order < 0) {
    throw new Error(`${file}: "order" must be a non-negative integer when present`);
  }
  const unknownProjects = related.filter(id => !projectIds.has(id));
  if (unknownProjects.length > 0) {
    throw new Error(`${file}: unknown project id(s) ${unknownProjects.join(", ")}; ids live in projects.json`);
  }

  return { title, description, date, tags, projects: related, order };
};

// A translation keeps the English date, tags and projects: they identify the post, its copy does not.
const assertSameIdentity = (file: string, source: PostFrontmatter, translation: PostFrontmatter) => {
  const differing = (["date", "tags", "projects", "order"] as const).filter(
    field => String(translation[field]) !== String(source[field]),
  );
  if (differing.length > 0) {
    throw new Error(`${file}: ${differing.join(", ")} must match the English file, only title and description change`);
  }
};

// One readdir per build; every translated file must sit next to its English source.
const listPostFiles = cache(async (): Promise<Set<string>> => {
  const files = new Set((await readdir(postsDir)).filter(file => file.endsWith(".mdx")));
  files.forEach(file => {
    const [, slug, locale] = file.match(POST_FILE) ?? [];
    if (!slug) throw new Error(`content/blog/${file}: file name must be <slug>.mdx or <slug>.<locale>.mdx`);
    if (locale && !isLocale(locale)) throw new Error(`content/blog/${file}: unknown locale "${locale}"`);
    if (locale && !files.has(`${slug}.mdx`)) throw new Error(`content/blog/${file} has no English source ${slug}.mdx`);
  });
  return files;
});

const compilePost = cache(async (file: string) => {
  const source = await readFile(join(postsDir, file), "utf8");
  const { content, frontmatter } = await compileMDX<Record<string, unknown>>({
    source,
    // remark-gfm adds the GitHub tables the posts use; the other extras it enables are listed in content.md.
    options: { parseFrontmatter: true, mdxOptions: { remarkPlugins: [remarkGfm] } },
    components: mdxComponents,
  });
  return { content, frontmatter: validateFrontmatter(`content/blog/${file}`, frontmatter) };
});

const readPost = async (slug: string, locale: Locale) => {
  if (!SLUG.test(slug)) throw new Error(`Invalid post slug "${slug}"`);
  const files = await listPostFiles();
  if (!files.has(postFile(slug, defaultLocale)))
    throw new Error(`content/blog/${postFile(slug, defaultLocale)} not found`);
  const available = locales.filter(candidate => files.has(postFile(slug, candidate)));
  // A post without a file in the requested locale serves its English body under that route, with a notice.
  const contentLocale = available.includes(locale) ? locale : defaultLocale;
  const { content, frontmatter } = await compilePost(postFile(slug, contentLocale));
  if (contentLocale !== defaultLocale) {
    const source = await compilePost(postFile(slug, defaultLocale));
    assertSameIdentity(`content/blog/${postFile(slug, contentLocale)}`, source.frontmatter, frontmatter);
  }
  const post: Post = {
    ...frontmatter,
    slug,
    locale,
    contentLocale,
    url: postUrl(locale, slug),
    canonicalUrl: postUrl(contentLocale, slug),
    locales: available,
  };
  return { post, content };
};

// react's cache dedupes the compile across generateMetadata, the page and the social image of one request.
export const getPost = cache(readPost);

export const getAllPosts = cache(async (locale: Locale): Promise<Post[]> => {
  const files = await listPostFiles();
  const slugs = [...files].flatMap(file => {
    const [, slug, fileLocale] = file.match(POST_FILE) ?? [];
    return slug && !fileLocale ? [slug] : [];
  });
  const posts = await Promise.all(slugs.map(async slug => (await readPost(slug, locale)).post));
  // Newest day first; within a day the higher order first, so a series published together reads in sequence.
  return posts.filter(isPublished).sort((a, b) => b.date.localeCompare(a.date) || b.order - a.order);
});

export const formatPostDate = (date: string, locale: Locale): string =>
  new Intl.DateTimeFormat(languageTags[locale], {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(date));
