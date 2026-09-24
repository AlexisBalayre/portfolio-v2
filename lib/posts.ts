// lib/posts.ts
import { cache } from "react";
import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";
import { compileMDX } from "next-mdx-remote/rsc";
import { mdxComponents } from "~~/mdx-components";
import { blogUrl } from "~~/lib/site";
import projects from "~~/public/assets/data/projects.json";

export interface PostFrontmatter {
  title: string;
  description: string;
  date: string;
  tags: string[];
  projects: string[];
}

export interface Post extends PostFrontmatter {
  slug: string;
  url: string;
}

const postsDir = join(process.cwd(), "content/blog");
const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
const projectIds = new Set(projects.map(project => project.id));

const isStringList = (value: unknown): value is string[] =>
  Array.isArray(value) && value.every(entry => typeof entry === "string" && entry.trim() !== "");

// Frontmatter is untyped YAML: a missing or malformed field must fail the build, not ship a broken post.
const validateFrontmatter = (slug: string, frontmatter: Record<string, unknown>): PostFrontmatter => {
  const file = `content/blog/${slug}.mdx`;
  const { title, description, date, tags, projects: related } = frontmatter;

  if (typeof title !== "string" || title.trim() === "") throw new Error(`${file}: "title" must be a non-empty string`);
  if (typeof description !== "string" || description.trim() === "") {
    throw new Error(`${file}: "description" must be a non-empty string`);
  }
  if (typeof date !== "string" || !ISO_DATE.test(date) || Number.isNaN(Date.parse(date))) {
    throw new Error(`${file}: "date" must be a YYYY-MM-DD string`);
  }
  if (!isStringList(tags) || tags.length === 0) throw new Error(`${file}: "tags" must be a non-empty list of strings`);
  if (!isStringList(related)) throw new Error(`${file}: "projects" must be a list of project ids`);
  const unknownProjects = related.filter(id => !projectIds.has(id));
  if (unknownProjects.length > 0) {
    throw new Error(`${file}: unknown project id(s) ${unknownProjects.join(", ")}; ids live in projects.json`);
  }

  return { title, description, date, tags, projects: related };
};

const readPost = async (slug: string) => {
  if (!SLUG.test(slug)) throw new Error(`Invalid post slug "${slug}"`);
  const source = await readFile(join(postsDir, `${slug}.mdx`), "utf8");
  const { content, frontmatter } = await compileMDX<Record<string, unknown>>({
    source,
    options: { parseFrontmatter: true },
    components: mdxComponents,
  });
  const post: Post = { ...validateFrontmatter(slug, frontmatter), slug, url: `${blogUrl}/${slug}` };
  return { post, content };
};

// react's cache dedupes the compile across generateMetadata, the page and the social image of one request.
export const getPost = cache(readPost);

export const getAllPosts = cache(async (): Promise<Post[]> => {
  const files = await readdir(postsDir);
  const slugs = files.filter(file => file.endsWith(".mdx")).map(file => file.slice(0, -".mdx".length));
  const posts = await Promise.all(slugs.map(async slug => (await readPost(slug)).post));
  return posts.sort((a, b) => b.date.localeCompare(a.date));
});

export const formatPostDate = (date: string): string =>
  new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }).format(
    new Date(date),
  );
