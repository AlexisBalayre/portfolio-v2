// app/page.tsx
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
import { getAllPosts } from "~~/lib/posts";
import experiences from "~~/public/assets/data/experiences.json";
import hackathons from "~~/public/assets/data/hackathons.json";
import education from "~~/public/assets/data/formation.json";
import projects from "~~/public/assets/data/projects.json";
import tech from "~~/public/assets/data/tech.json";

export default async function Page() {
  const posts = await getAllPosts();

  return (
    <>
      <div className="pt-10 mx-auto w-full overflow-y-auto overflow-x-hidden mt-20">
        <div className="px-5">
          <h1 className="text-center mb-8 text-4xl font-bold text-primary">
            <span className="block text-2xl mb-2 text-neutral-content font-light">Meet</span>
            Alexis Balayre
          </h1>
          <div className="max-w-2xl mx-auto">
            <p className="text-center text-lg text-neutral-content">
              AI Engineer specialising in real-time speech AI, LLM systems and production ML. Building Lia Live AI,
              Acolad&apos;s real-time AI interpreting platform, in Paris.
            </p>
          </div>

          {/* About me */}
          <AboutMe />

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
                Experiences
              </h2>
            </span>
            <Timeline items={experiences} />
          </section>

          {/* Projects */}
          <section className="md:py-12 mx-auto container scroll-mt-24" id="projects" aria-labelledby="projects-heading">
            <div className="md:mb-10"></div>
            <span className="flex flex-row items-center justify-center md:justify-start mb-10 md:mb-20">
              <TrophyIcon className="h-8 w-8 mr-2 flex" />
              <h2 id="projects-heading" className="text-4xl font-bold text-center md:text-left place-self-center">
                Projects
              </h2>
            </span>
            <Projects items={projects} posts={posts} />
          </section>

          {/* Skills */}
          <section className="md:py-12 mx-auto container scroll-mt-24" id="skills" aria-labelledby="skills-heading">
            <div className="md:mb-10"></div>
            <span className="flex flex-row items-center justify-center md:justify-start mb-10 md:mb-20">
              <CodeBracketIcon className="h-8 w-8 mr-2 flex place-self-center" />
              <h2 id="skills-heading" className="text-4xl font-bold text-center md:text-left">
                Skills
              </h2>
            </span>
            <Skills items={tech} />
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
                Hackathons
              </h2>
            </span>
            <Timeline items={hackathons} />
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
                Education
              </h2>
            </span>
            <Timeline items={education} />
          </section>
        </div>
      </div>
    </>
  );
}
