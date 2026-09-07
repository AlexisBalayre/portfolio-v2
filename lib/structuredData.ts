// lib/structuredData.ts
interface TimelineEntry {
  logo: string;
  title: string;
  period: string;
  description: string;
}

interface ProjectEntry {
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

export const buildStructuredData = (profile: Profile, data: PortfolioData) => {
  const websiteId = `${profile.siteUrl}/#website`;
  const pageId = `${profile.siteUrl}/#profilepage`;
  const personId = `${profile.siteUrl}/#person`;
  const projectsId = `${profile.siteUrl}/#projects`;

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
    inLanguage: "en-GB",
    publisher: { "@id": personId },
  };

  const profilePage = {
    "@type": "ProfilePage",
    "@id": pageId,
    url: profile.siteUrl,
    name: profile.siteName,
    inLanguage: "en-GB",
    isPartOf: { "@id": websiteId },
    about: { "@id": personId },
    mainEntity: { "@id": personId },
    primaryImageOfPage: { "@type": "ImageObject", url: profile.imageUrl },
  };

  const projects = {
    "@type": "ItemList",
    "@id": projectsId,
    name: `Projects by ${profile.name}`,
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

// "<" must never reach the <script> element: a "</script" inside any string would close it early.
// \u003c is a valid JSON escape, so consumers parse an identical graph.
export const serialiseStructuredData = (graph: unknown): string => JSON.stringify(graph).replace(/</g, "\\u003c");
