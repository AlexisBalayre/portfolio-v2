// app/page.tsx
"use client";

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { AcademicCapIcon, BriefcaseIcon, CodeBracketIcon, TrophyIcon, UserIcon } from "@heroicons/react/24/outline";

import Projects from "~~/components/Projects";
import Skills from "~~/components/Skills";
import Timeline from "~~/components/Timeline";
import experiences from "~~/public/assets/data/experiences.json";
import education from "~~/public/assets/data/formation.json";
import projects from "~~/public/assets/data/projects.json";
import tech from "~~/public/assets/data/tech.json";
import { GithubLogo } from "~~/public/assets/logos/GithubLogo";
import { LinkedinLogo } from "~~/public/assets/logos/LinkedinLogo";

export default function Page() {
  const [isActive, setIsActive] = useState(false);
  const sectionRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(entries => entries.forEach(e => setIsActive(e.isIntersecting)), {
      threshold: 0.3,
    });
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => {
      if (sectionRef.current) observer.unobserve(sectionRef.current);
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

          <div className="w-full text-center rounded-xl hidden md:grid mt-10">
            <iframe
              className="w-1/2 place-self-center rounded-xl"
              src="https://www.youtube.com/embed/aLr04QRIzbQ?si=e-xkmN-wDCRUk-D5"
              title="YouTube video player"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              referrerPolicy="strict-origin-when-cross-origin"
              style={{ aspectRatio: "16 / 9" }}
              allowFullScreen
            ></iframe>
          </div>

          {/* About me */}
          <div
            className="mx-auto container grid grid-cols-1 md:grid-cols-2 gap-8 items-center justify-center mt-20"
            ref={sectionRef}
            id="aboutMe"
          >
            <div className="order-2 md:order-1 mx-auto container">
              <span className="flex flex-row items-center justify-center md:justify-start mb-3">
                <UserIcon className="h-8 w-8 mr-2 flex place-self-center" />
                <h2
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
                <strong>Birth Date:</strong> Avril 15, 2001
              </p>
              <p className={`transition-colors duration-500 mb-4 md:ml-10 ${isActive ? "" : "text-gray-600"}`}>
                <strong>Nationality:</strong> French
              </p>
              <p className={`transition-colors duration-500 mb-4 md:ml-10 ${isActive ? "" : "text-gray-600"}`}>
                <strong>Location:</strong> Paris, France
              </p>
              <p className={`transition-colors duration-500 mb-4 md:ml-10 ${isActive ? "" : "text-gray-600"}`}>
                <strong>Degrees:</strong> ISEP Software Engineering Master Degree | Msc in applied AI at Cranfield
                University
              </p>
              <p
                className={`transition-colors duration-500 mb-4 text-justify md:ml-10 ${isActive ? "" : "text-gray-600"}`}
              >
                <strong>Specialisations:</strong> Data Science | Machine Learning | Software Engineering
              </p>
              <p
                className={`transition-colors duration-500 mb-4 text-justify md:ml-10 ${isActive ? "" : "text-gray-600"}`}
              >
                <strong>Role:</strong> AI Engineer
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
                AI Engineer with a dual background in Software Engineering and Data Science, experienced in delivering
                production-ready AI solutions that bridge research and business impact. Skilled in Machine Learning,
                Generative AI, and Agentic Systems, with a proven ability to turn prototypes into scalable products that
                create measurable value. Recognised for resourcefulness, determination, and meticulous attention to
                detail, and driven by a strong interest in AI Safety.
              </p>
            </div>

            <div className="flex justify-center order-1 md:order-2 mb-8 md:mb-0">
              <div className="relative">
                <Image
                  src="/assets/img/alexis.jpg"
                  alt="Alexis Balayre Profile Picture"
                  className="rounded-full"
                  width={180}
                  height={200}
                />
                <a
                  className="btn btn-primary justify-center mt-10 rounded-lg"
                  href="https://alexis-resume.balayre.com/"
                  target="_blank"
                  rel="noreferrer nofollow"
                  aria-label="Download Resume of Alexis Balayre"
                >
                  Download Resume
                </a>
              </div>
            </div>
          </div>

          <div className="w-full text-center rounded-xl grid md:hidden mt-4">
            <iframe
              className="w-full place-self-center rounded-xl"
              src="https://www.youtube.com/embed/aLr04QRIzbQ?si=e-xkmN-wDCRUk-D5"
              title="YouTube video player"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              referrerPolicy="strict-origin-when-cross-origin"
              style={{ aspectRatio: "16 / 9" }}
              allowFullScreen
            ></iframe>
          </div>

          {/* Education */}
          <div className="md:py-12 mx-auto container mt-10 md:mt-0" id="education">
            <div className="md:mb-10"></div>
            <span className="flex flex-row items-center justify-center md:justify-start mb-10 md:mb-20">
              <AcademicCapIcon className="h-8 w-8 mr-2 flex place-self-center" />
              <h2 className="text-4xl font-bold text-center md:text-left">Education</h2>
            </span>
            <Timeline items={education} />
          </div>

          {/* Experiences */}
          <div className="md:py-12 mx-auto container" id="experiences">
            <div className="md:mb-10"></div>
            <span className="flex flex-row items-center justify-center md:justify-start mb-10 md:mb-20">
              <BriefcaseIcon className="h-8 w-8 mr-2 flex place-self-center" />
              <h2 className="text-4xl font-bold text-center md:text-left">Experiences</h2>
            </span>
            <Timeline items={experiences} />
          </div>

          {/* Skills */}
          <div className="md:py-12 mx-auto container" id="skills">
            <div className="md:mb-10"></div>
            <span className="flex flex-row items-center justify-center md:justify-start mb-10 md:mb-20">
              <CodeBracketIcon className="h-8 w-8 mr-2 flex place-self-center" />
              <h2 className="text-4xl font-bold text-center md:text-left">Skills</h2>
            </span>
            <Skills items={tech} />
          </div>

          {/* Projects */}
          <div className="md:py-12 mx-auto container mt-10 md:mt-0" id="projects">
            <div className="md:mb-10"></div>
            <span className="flex flex-row items-center justify-center md:justify-start mb-10 md:mb-20">
              <TrophyIcon className="h-8 w-8 mr-2 flex" />
              <h2 className="text-4xl font-bold text-center md:text-left place-self-center">Projects</h2>
            </span>
            <Projects items={projects} />
          </div>
        </div>
      </div>
    </>
  );
}
