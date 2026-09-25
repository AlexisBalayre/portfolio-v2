// lib/structuredData.ts
import { languageTags, locales, type Locale } from "~~/lib/i18n";

interface TimelineEntry {
  logo: string;
  title: string;
  period: string;
  description: string;
}

interface ProjectEntry {
  id: string;
  name: string;
  description: string;
  url: string;
  technologies: string[];
  image: string;
}

interface SkillCategory {
  name: string;
  skills: { name: string; tier: string }[];
}

export interface Profile {
  siteUrl: string;
  // The home page of the locale being rendered: siteUrl for English, siteUrl/fr for French.
  pageUrl: string;
  siteName: string;
  name: string;
  givenName: string;
  familyName: string;
  jobTitle: string;
  description: string;
  email: string;
  imageUrl: string;
  locality: string;
  countryCode: string;
  nationality: string;
  sameAs: string[];
  knowsLanguage: string[];
  knowsAbout: string[];
  projectsListName: string;
}

export interface PortfolioData {
  experiences: TimelineEntry[];
  formation: TimelineEntry[];
  hackathons: TimelineEntry[];
  projects: ProjectEntry[];
  tech: SkillCategory[];
}

const HTML_ENTITIES: Record<string, string> = { "&#39;": "'", "&apos;": "'", "&amp;": "&", "&quot;": '"' };

export const stripHtml = (html: string): string =>
  html
    .replace(/<[^>]*>/g, "")
    .replace(/&#39;|&apos;|&amp;|&quot;/g, entity => HTML_ENTITIES[entity])
    .replace(/\s+/g, " ")
    .trim();

const firstHref = (html: string): string | undefined => html.match(/href="([^"]+)"/)?.[1];

// Timeline titles read "<role> at <organisation>"; the organisation may be wrapped in a link.
const parsePosition = (entry: TimelineEntry) => {
  const text = stripHtml(entry.title);
  const separator = text.lastIndexOf(" at ");
  return {
    role: separator === -1 ? text : text.slice(0, separator),
    organisation: separator === -1 ? undefined : text.slice(separator + 4),
    url: firstHref(entry.title),
    isCurrent: /present/i.test(entry.period),
  };
};

// Education titles read "<school> - <degree>"; the degree may be wrapped in a link.
const parseDegree = (entry: TimelineEntry) => {
  const text = stripHtml(entry.title);
  const separator = text.indexOf(" - ");
  return {
    school: separator === -1 ? text : text.slice(0, separator),
    degree: separator === -1 ? undefined : text.slice(separator + 3),
    url: firstHref(entry.title),
  };
};

const organization = (name: string, url?: string) => ({
  "@type": "Organization",
  name,
  ...(url && { url }),
});

const university = (name: string, url?: string) => ({
  "@type": "CollegeOrUniversity",
  name,
  ...(url && { url }),
});

// WebSite and Person are one entity each, shared by every locale through their @id; the ProfilePage
// and the projects ItemList are per locale because their text and URL differ.
export const buildStructuredData = (profile: Profile, data: PortfolioData, locale: Locale) => {
  const websiteId = `${profile.siteUrl}/#website`;
  const pageId = `${profile.pageUrl}/#profilepage`;
  const personId = `${profile.siteUrl}/#person`;
  const projectsId = `${profile.pageUrl}/#projects`;

  const positions = data.experiences.map(parsePosition).filter(position => position.organisation);
  const currentEmployers = positions.filter(position => position.isCurrent);
  const formerOrganisations = positions.filter(position => !position.isCurrent);
  const degrees = data.formation.map(parseDegree);
  const credentials = degrees.filter(entry => entry.degree && /MSc|Master/i.test(entry.degree));

  const coreSkills = data.tech.flatMap(category =>
    category.skills.filter(skill => skill.tier === "Core").map(skill => skill.name),
  );
  const knowsAbout = [...new Set([...profile.knowsAbout, ...coreSkills])];

  // Schools first so a school that also appears as a former employer keeps its CollegeOrUniversity type.
  const alumniOf = [
    ...degrees.map(entry => university(entry.school, entry.url)),
    ...formerOrganisations.map(position => organization(position.organisation as string, position.url)),
  ].filter((entry, index, all) => all.findIndex(other => other.name === entry.name) === index);

  const person = {
    "@type": "Person",
    "@id": personId,
    name: profile.name,
    givenName: profile.givenName,
    familyName: profile.familyName,
    url: profile.siteUrl,
    mainEntityOfPage: { "@id": pageId },
    image: { "@type": "ImageObject", url: profile.imageUrl, caption: profile.name },
    jobTitle: profile.jobTitle,
    description: profile.description,
    email: `mailto:${profile.email}`,
    nationality: { "@type": "Country", name: profile.nationality },
    address: { "@type": "PostalAddress", addressLocality: profile.locality, addressCountry: profile.countryCode },
    homeLocation: { "@type": "City", name: profile.locality },
    worksFor: currentEmployers.map(position => organization(position.organisation as string, position.url)),
    hasOccupation: currentEmployers.map(position => ({
      "@type": "Occupation",
      name: position.role,
      occupationLocation: { "@type": "City", name: profile.locality },
    })),
    alumniOf: alumniOf,
    hasCredential: credentials.map(entry => ({
      "@type": "EducationalOccupationalCredential",
      name: entry.degree,
      credentialCategory: "degree",
      recognizedBy: university(entry.school, entry.url),
    })),
    award: data.hackathons.map(entry => stripHtml(entry.title)),
    knowsLanguage: profile.knowsLanguage,
    knowsAbout,
    sameAs: profile.sameAs,
  };

  const website = {
    "@type": "WebSite",
    "@id": websiteId,
    name: profile.siteName,
    url: profile.siteUrl,
    inLanguage: locales.map(entry => languageTags[entry]),
    publisher: { "@id": personId },
  };

  const profilePage = {
    "@type": "ProfilePage",
    "@id": pageId,
    url: profile.pageUrl,
    name: profile.siteName,
    inLanguage: languageTags[locale],
    isPartOf: { "@id": websiteId },
    about: { "@id": personId },
    mainEntity: { "@id": personId },
    primaryImageOfPage: { "@type": "ImageObject", url: profile.imageUrl },
  };

  const projects = {
    "@type": "ItemList",
    "@id": projectsId,
    name: profile.projectsListName,
    numberOfItems: data.projects.length,
    itemListElement: data.projects.map((project, index) => ({
      "@type": "ListItem",
      position: index + 1,
      item: {
        "@type": "SoftwareSourceCode",
        name: project.name,
        description: project.description,
        url: project.url,
        codeRepository: project.url,
        image: project.image,
        keywords: project.technologies.join(", "),
        author: { "@id": personId },
      },
    })),
  };

  return { "@context": "https://schema.org", "@graph": [website, profilePage, person, projects] };
};

export interface BlogPostEntry {
  slug: string;
  // The URL and language of the body itself: a French route that fell back to English points at the English post.
  canonicalUrl: string;
  contentLocale: Locale;
  title: string;
  description: string;
  date: string;
  tags: string[];
}

export interface BlogProfile {
  siteUrl: string;
  name: string;
  locale: Locale;
  blogUrl: string;
  blogTitle: string;
  blogDescription: string;
}

// The blog nodes reference the Person of the profile graph by @id, so every page shares one author entity.
const blogNode = (profile: BlogProfile) => ({
  "@type": "Blog",
  "@id": `${profile.blogUrl}/#blog`,
  name: `${profile.blogTitle} | ${profile.name}`,
  url: profile.blogUrl,
  description: profile.blogDescription,
  inLanguage: languageTags[profile.locale],
  isPartOf: { "@id": `${profile.siteUrl}/#website` },
  publisher: { "@id": `${profile.siteUrl}/#person` },
});

export const buildBlogPosting = (profile: BlogProfile, post: BlogPostEntry) => ({
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  "@id": `${post.canonicalUrl}/#blogposting`,
  headline: post.title,
  description: post.description,
  url: post.canonicalUrl,
  mainEntityOfPage: { "@type": "WebPage", "@id": post.canonicalUrl },
  datePublished: post.date,
  dateModified: post.date,
  inLanguage: languageTags[post.contentLocale],
  keywords: post.tags.join(", "),
  image: `${post.canonicalUrl}/opengraph-image`,
  author: { "@type": "Person", "@id": `${profile.siteUrl}/#person`, name: profile.name },
  publisher: { "@type": "Person", "@id": `${profile.siteUrl}/#person`, name: profile.name },
  isPartOf: blogNode(profile),
});

export const buildBlog = (profile: BlogProfile, posts: BlogPostEntry[]) => ({
  "@context": "https://schema.org",
  ...blogNode(profile),
  blogPost: posts.map(post => ({
    "@type": "BlogPosting",
    "@id": `${post.canonicalUrl}/#blogposting`,
    headline: post.title,
    url: post.canonicalUrl,
    datePublished: post.date,
  })),
});

export interface Breadcrumb {
  name: string;
  url: string;
}

// Home > Blog > Post in the reader's locale; search results show it in place of the raw URL.
export const buildBreadcrumbs = (crumbs: Breadcrumb[]) => ({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: crumbs.map((crumb, index) => ({
    "@type": "ListItem",
    position: index + 1,
    name: crumb.name,
    item: crumb.url,
  })),
});

// "<" must never reach the <script> element: a "</script" inside any string would close it early.
// \u003c is a valid JSON escape, so consumers parse an identical graph.
export const serialiseStructuredData = (graph: unknown): string => JSON.stringify(graph).replace(/</g, "\\u003c");
