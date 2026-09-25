// app/[locale]/page.tsx
import React from "react";
import {
  AcademicCapIcon,
  BriefcaseIcon,
  CodeBracketIcon,
  RocketLaunchIcon,
  TrophyIcon,
} from "@heroicons/react/24/outline";

import { AboutMe } from "~~/components/AboutMe";
import Projects from "~~/components/Projects";
import Skills from "~~/components/Skills";
import Timeline from "~~/components/Timeline";
import { getDictionary, toLocale } from "~~/lib/i18n";
import { getPortfolio } from "~~/lib/portfolio";
import { getAllPosts } from "~~/lib/posts";

interface PageProps {
  params: Promise<{ locale: string }>;
}

export default async function Page({ params }: PageProps) {
  const locale = toLocale((await params).locale);
  const t = getDictionary(locale);
  const { about, experiences, formation, hackathons, projects, tech } = getPortfolio(locale);
  const posts = await getAllPosts(locale);

  return (
    <>
      <div className="pt-10 mx-auto w-full overflow-y-auto overflow-x-hidden mt-20">
        <div className="px-5">
          <h1 className="text-center mb-8 text-4xl font-bold text-primary">
            <span className="block text-2xl mb-2 text-neutral-content font-light">{t.home.meet}</span>
            Alexis Balayre
          </h1>
          <div className="max-w-2xl mx-auto">
            <p className="text-center text-lg text-neutral-content">{about.intro}</p>
          </div>

          {/* About me */}
          <AboutMe locale={locale} about={about} />

          {/* Experiences */}
          <section
            className="md:py-12 mx-auto container scroll-mt-24"
            id="experiences"
            aria-labelledby="experiences-heading"
          >
            <div className="md:mb-10"></div>
            <span className="flex flex-row items-center justify-center md:justify-start mb-10 md:mb-20">
              <BriefcaseIcon className="h-8 w-8 mr-2 flex place-self-center" />
              <h2 id="experiences-heading" className="text-4xl font-bold text-center md:text-left">
                {t.nav.experiences}
              </h2>
            </span>
            <Timeline items={experiences} locale={locale} />
          </section>

          {/* Projects */}
          <section className="md:py-12 mx-auto container scroll-mt-24" id="projects" aria-labelledby="projects-heading">
            <div className="md:mb-10"></div>
            <span className="flex flex-row items-center justify-center md:justify-start mb-10 md:mb-20">
              <TrophyIcon className="h-8 w-8 mr-2 flex" />
              <h2 id="projects-heading" className="text-4xl font-bold text-center md:text-left place-self-center">
                {t.nav.projects}
              </h2>
            </span>
            <Projects items={projects} posts={posts} locale={locale} />
          </section>

          {/* Skills */}
          <section className="md:py-12 mx-auto container scroll-mt-24" id="skills" aria-labelledby="skills-heading">
            <div className="md:mb-10"></div>
            <span className="flex flex-row items-center justify-center md:justify-start mb-10 md:mb-20">
              <CodeBracketIcon className="h-8 w-8 mr-2 flex place-self-center" />
              <h2 id="skills-heading" className="text-4xl font-bold text-center md:text-left">
                {t.nav.skills}
              </h2>
            </span>
            <Skills items={tech} locale={locale} />
          </section>

          {/* Hackathons */}
          <section
            className="md:py-12 mx-auto container scroll-mt-24"
            id="hackathons"
            aria-labelledby="hackathons-heading"
          >
            <div className="md:mb-10"></div>
            <span className="flex flex-row items-center justify-center md:justify-start mb-10 md:mb-20">
              <RocketLaunchIcon className="h-8 w-8 mr-2 flex place-self-center" />
              <h2 id="hackathons-heading" className="text-4xl font-bold text-center md:text-left">
                {t.nav.hackathons}
              </h2>
            </span>
            <Timeline items={hackathons} locale={locale} />
          </section>

          {/* Education */}
          <section
            className="md:py-12 mx-auto container mt-10 md:mt-0 scroll-mt-24"
            id="education"
            aria-labelledby="education-heading"
          >
            <div className="md:mb-10"></div>
            <span className="flex flex-row items-center justify-center md:justify-start mb-10 md:mb-20">
              <AcademicCapIcon className="h-8 w-8 mr-2 flex place-self-center" />
              <h2 id="education-heading" className="text-4xl font-bold text-center md:text-left">
                {t.nav.education}
              </h2>
            </span>
            <Timeline items={formation} locale={locale} />
          </section>
        </div>
      </div>
    </>
  );
}
