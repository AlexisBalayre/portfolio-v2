// lib/portfolio.ts
// The one loader for the portfolio content JSON, per locale. The French files mirror the English ones
// entry for entry; a missing or misplaced entry throws here, at import time, so the build fails instead
// of rendering a French page with a hole in it.
import type { Locale } from "~~/lib/i18n";
import enAbout from "~~/public/assets/data/en/about.json";
import enExperiences from "~~/public/assets/data/en/experiences.json";
import enFormation from "~~/public/assets/data/en/formation.json";
import enHackathons from "~~/public/assets/data/en/hackathons.json";
import enProjects from "~~/public/assets/data/en/projects.json";
import enTech from "~~/public/assets/data/en/tech.json";
import frAbout from "~~/public/assets/data/fr/about.json";
import frExperiences from "~~/public/assets/data/fr/experiences.json";
import frFormation from "~~/public/assets/data/fr/formation.json";
import frHackathons from "~~/public/assets/data/fr/hackathons.json";
import frProjects from "~~/public/assets/data/fr/projects.json";
import frTech from "~~/public/assets/data/fr/tech.json";

export type About = typeof enAbout;
export type TimelineItem = (typeof enExperiences)[number];
export type Project = (typeof enProjects)[number];
export type SkillCategory = (typeof enTech)[number];

export interface PortfolioData {
  about: About;
  experiences: TimelineItem[];
  formation: TimelineItem[];
  hackathons: TimelineItem[];
  projects: Project[];
  tech: SkillCategory[];
}

const portfolio: Record<Locale, PortfolioData> = {
  en: {
    about: enAbout,
    experiences: enExperiences,
    formation: enFormation,
    hackathons: enHackathons,
    projects: enProjects,
    tech: enTech,
  },
  fr: {
    about: frAbout,
    experiences: frExperiences,
    formation: frFormation,
    hackathons: frHackathons,
    projects: frProjects,
    tech: frTech,
  },
};

// Entries are matched by position on a locale-independent key (logo, project id, skill names), since
// timeline items have no id and every translated field may legitimately differ.
const assertSameEntries = <T>(
  file: string,
  source: T[],
  translation: T[],
  keyOf: (entry: T, index: number) => string,
) => {
  const expected = source.map(keyOf);
  const actual = translation.map(keyOf);
  expected.forEach((key, index) => {
    if (actual[index] === key) return;
    const found = actual[index] === undefined ? "nothing" : `"${actual[index]}"`;
    throw new Error(
      `public/assets/data/fr/${file}: entry ${index} should be "${key}", found ${found}; ` +
        "the French files mirror public/assets/data/en/ entry for entry",
    );
  });
  if (actual.length > expected.length) {
    throw new Error(
      `public/assets/data/fr/${file}: ${actual.length - expected.length} extra entr(y|ies) with no English counterpart`,
    );
  }
};

const skillNames = (category: SkillCategory) => category.skills.map(skill => skill.name).join(", ");

assertSameEntries("experiences.json", portfolio.en.experiences, portfolio.fr.experiences, entry => entry.logo);
assertSameEntries("formation.json", portfolio.en.formation, portfolio.fr.formation, entry => entry.logo);
assertSameEntries("hackathons.json", portfolio.en.hackathons, portfolio.fr.hackathons, entry => entry.logo);
assertSameEntries("projects.json", portfolio.en.projects, portfolio.fr.projects, project => project.id);
assertSameEntries("tech.json", portfolio.en.tech, portfolio.fr.tech, skillNames);
assertSameEntries("about.json", portfolio.en.about.facts, portfolio.fr.about.facts, (_, index) => `fact ${index}`);

export const getPortfolio = (locale: Locale): PortfolioData => portfolio[locale];
