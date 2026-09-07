// app/page.tsx
"use client";

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import {
  AcademicCapIcon,
  BriefcaseIcon,
  CodeBracketIcon,
  RocketLaunchIcon,
  TrophyIcon,
  UserIcon,
} from "@heroicons/react/24/outline";

import Projects from "~~/components/Projects";
import Skills from "~~/components/Skills";
import Timeline from "~~/components/Timeline";
import experiences from "~~/public/assets/data/experiences.json";
import hackathons from "~~/public/assets/data/hackathons.json";
import education from "~~/public/assets/data/formation.json";
import projects from "~~/public/assets/data/projects.json";
import tech from "~~/public/assets/data/tech.json";
import { GithubLogo } from "~~/public/assets/logos/GithubLogo";
import { LinkedinLogo } from "~~/public/assets/logos/LinkedinLogo";

export default function Page() {
  const [isActive, setIsActive] = useState(false);
  const sectionRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const el = sectionRef.current; // snapshot the element once
    if (!el) return;

    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          setIsActive(entry.isIntersecting);
        });
      },
      { threshold: 0.3 },
    );

    observer.observe(el);

    return () => {
      observer.unobserve(el); // always refers to the same node
    };
  }, []);

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
          <section
            className="mx-auto container grid grid-cols-1 md:grid-cols-2 gap-8 items-center justify-center mt-20 scroll-mt-24"
            ref={sectionRef}
            id="aboutMe"
            aria-labelledby="aboutMe-heading"
          >
            <div className="order-2 md:order-1 mx-auto container">
              <span className="flex flex-row items-center justify-center md:justify-start mb-3">
                <UserIcon className="h-8 w-8 mr-2 flex place-self-center" />
                <h2
                  id="aboutMe-heading"
                  className={`transition-colors duration-500 text-4xl font-bold text-center md:text-left ${
                    isActive ? "" : "text-gray-600"
                  }`}
                >
                  Who am I?
                </h2>
              </span>

              <p className={`transition-colors duration-500 mb-4 mt-10 md:ml-10 ${isActive ? "" : "text-gray-600"}`}>
                <strong>Name:</strong> Alexis Balayre
              </p>
              <p className={`transition-colors duration-500 mb-4 md:ml-10 ${isActive ? "" : "text-gray-600"}`}>
                <strong>Nationality:</strong> French
              </p>
              <p className={`transition-colors duration-500 mb-4 md:ml-10 ${isActive ? "" : "text-gray-600"}`}>
                <strong>Location:</strong> Paris, France
              </p>
              <p className={`transition-colors duration-500 mb-4 md:ml-10 ${isActive ? "" : "text-gray-600"}`}>
                <strong>Degrees:</strong> ISEP Engineering Master&#39;s Degree | MSc in Computational and Software
                Techniques in Engineering, Cranfield University
              </p>
              <p
                className={`transition-colors duration-500 mb-4 text-justify md:ml-10 ${isActive ? "" : "text-gray-600"}`}
              >
                <strong>Specialisations:</strong> Real-Time Speech AI | LLM Systems | Agentic Systems | Production ML |
                Software Engineering
              </p>
              <p
                className={`transition-colors duration-500 mb-4 text-justify md:ml-10 ${isActive ? "" : "text-gray-600"}`}
              >
                <strong>Role:</strong> AI Engineer at Acolad, building Lia Live AI
              </p>
              <span className="flex flex-row md:ml-10 gap-10 justify-center mt-5">
                <div className="flex">
                  <a
                    href="https://www.linkedin.com/in/alexis-balayre"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="transition text-neutral-content hover:text-primary-content"
                    aria-label="LinkedIn of Alexis Balayre"
                  >
                    <LinkedinLogo className="w-6 h-6" />
                  </a>
                </div>
                <div className="flex">
                  <a
                    href="https://github.com/AlexisBalayre"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="transition flex text-neutral-content hover:text-primary-content"
                    aria-label="GitHub of Alexis Balayre"
                  >
                    <GithubLogo className="w-6 h-6" />
                  </a>
                </div>
              </span>
              <div className="divider divider-neutral "></div>
              <p className={`transition-colors duration-500 text-justify md:ml-10 ${isActive ? "" : "text-gray-600"}`}>
                AI Engineer specialising in real-time speech AI, LLM systems and production ML, with a dual background
                in Software Engineering and Data Science. I design, build and operate AI systems end to end, from
                architecture through deployment. At Acolad I build Lia Live AI, our real-time AI interpreting platform:
                speech in, interpreted speech out in under a second, across 80+ languages. That covers the streaming
                ASR, LLM translation and TTS pipelines, the distributed backend behind live sessions, multi-provider
                routing, and the evaluation framework that settles every model choice on quality and latency. Next:
                fine-tuning, inference optimisation and on-device deployment. Before that, I applied NLP and generative
                AI (RAG, GraphRAG) at Dassault Systèmes and did deep learning research with Airbus on computer vision
                for autonomous aircraft refuelling. I also build in the open, mostly AI tooling and pipelines. And I
                care about AI security: as these systems take on more autonomy and more sensitive data, making them
                trustworthy matters as much as making them capable.
              </p>
            </div>

            <div className="flex justify-center order-1 md:order-2 mb-8 md:mb-0">
              <div className="relative">
                <Image
                  src="/assets/img/alexis.jpg"
                  alt="Portrait of Alexis Balayre, AI Engineer"
                  className="rounded-full"
                  width={180}
                  height={180}
                  priority
                />
                <a
                  className="btn btn-primary justify-center mt-10 rounded-lg"
                  href="https://alexis-resume.balayre.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Download Resume of Alexis Balayre"
                >
                  Download Resume
                </a>
              </div>
            </div>
          </section>

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
            <Projects items={projects} />
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
