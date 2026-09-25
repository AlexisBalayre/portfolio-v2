"use client";

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { UserIcon } from "@heroicons/react/24/outline";
import { getDictionary, type Locale } from "~~/lib/i18n";
import type { About } from "~~/lib/portfolio";
import { GithubLogo } from "~~/public/assets/logos/GithubLogo";
import { LinkedinLogo } from "~~/public/assets/logos/LinkedinLogo";

interface AboutMeProps {
  locale: Locale;
  about: About;
}

/**
 * About Me section: the one block of the home page that needs the browser (IntersectionObserver fade-in).
 */
export const AboutMe = ({ locale, about }: AboutMeProps) => {
  const t = getDictionary(locale);
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
            {t.home.aboutHeading}
          </h2>
        </span>

        {about.facts.map((fact, index) => (
          <p
            key={fact.label}
            className={`transition-colors duration-500 mb-4 text-justify md:ml-10 ${index === 0 ? "mt-10" : ""} ${
              isActive ? "" : "text-gray-600"
            }`}
          >
            <strong>{fact.label}</strong> {fact.value}
          </p>
        ))}
        <span className="flex flex-row md:ml-10 gap-10 justify-center mt-5">
          <div className="flex">
            <a
              href="https://www.linkedin.com/in/alexis-balayre"
              target="_blank"
              rel="noopener noreferrer"
              className="transition text-neutral-content hover:text-primary-content"
              aria-label={t.home.linkedinAria}
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
              aria-label={t.home.githubAria}
            >
              <GithubLogo className="w-6 h-6" />
            </a>
          </div>
        </span>
        <div className="divider divider-neutral "></div>
        <p className={`transition-colors duration-500 text-justify md:ml-10 ${isActive ? "" : "text-gray-600"}`}>
          {about.bio}
        </p>
      </div>

      <div className="flex justify-center order-1 md:order-2 mb-8 md:mb-0">
        <div className="relative">
          <Image
            src="/assets/img/alexis.jpg"
            alt={t.home.portraitAlt}
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
            aria-label={t.home.downloadResumeAria}
          >
            {t.home.downloadResume}
          </a>
        </div>
      </div>
    </section>
  );
};
