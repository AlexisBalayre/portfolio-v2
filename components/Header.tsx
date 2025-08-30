"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  AcademicCapIcon,
  Bars3Icon,
  BriefcaseIcon,
  CodeBracketIcon,
  TrophyIcon,
  UserIcon,
} from "@heroicons/react/24/outline";
import { CalendarIcon, EnvelopeIcon, PhoneIcon } from "@heroicons/react/24/solid";
import { useOutsideClick } from "~~/hooks";

interface HeaderMenuLink {
  label: string;
  section: string;
  icon?: React.ReactNode;
}

export const menuLinks: HeaderMenuLink[] = [
  {
    label: "About Me",
    section: "aboutMe",
    icon: <UserIcon className="h-4 w-4" />,
  },
  {
    label: "Education",
    section: "education",
    icon: <AcademicCapIcon className="h-4 w-4" />,
  },
  {
    label: "Experiences",
    section: "experiences",
    icon: <BriefcaseIcon className="h-4 w-4" />,
  },
  {
    label: "Skills",
    section: "skills",
    icon: <CodeBracketIcon className="h-4 w-4" />,
  },
  {
    label: "Projects",
    section: "projects",
    icon: <TrophyIcon className="h-4 w-4" />,
  },
];

export const HeaderMenuLinks = () => {
  const [isActive, setIsActive] = useState({
    aboutMe: true,
    education: false,
    experiences: false,
    skills: false,
    projects: false,
  });

  const checkVisibility = () => {
    let closestSection: string | null = null;

    Object.keys(isActive).forEach(section => {
      const sectionEl = document.getElementById(section);
      if (sectionEl) {
        const rect = sectionEl.getBoundingClientRect();
        if (rect.top <= window.innerHeight / 2 && rect.bottom >= window.innerHeight / 2) {
          closestSection = section;
        }
      }
    });

    setIsActive({
      aboutMe: closestSection === "aboutMe",
      education: closestSection === "education",
      experiences: closestSection === "experiences",
      skills: closestSection === "skills",
      projects: closestSection === "projects",
    });
  };

  useEffect(() => {
    // Vérifie à l'init puis sur scroll
    checkVisibility();
    window.addEventListener("scroll", checkVisibility, { passive: true });
    return () => {
      window.removeEventListener("scroll", checkVisibility);
    };
  }, []);

  return (
    <>
      {menuLinks.map(({ label, section, icon }) => (
        <li key={section}>
          <span
            onClick={() => {
              document.getElementById(section)?.scrollIntoView({ behavior: "smooth" });
            }}
            className={`${
              isActive[section as keyof typeof isActive] ? "bg-primary shadow-md text-accent-content" : ""
            } hover:bg-secondary hover:shadow-md cursor-pointer focus:!bg-accent active:!text-neutral py-1.5 px-3 text-sm rounded-full gap-2 grid grid-flow-col`}
          >
            {icon}
            <span>{label}</span>
          </span>
        </li>
      ))}
    </>
  );
};

/**
 * Site header
 */
export const Header = () => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const burgerMenuRef = useRef<HTMLDivElement>(null) as React.RefObject<HTMLDivElement>;

  useOutsideClick(
    burgerMenuRef,
    useCallback(() => setIsDrawerOpen(false), []),
  );

  return (
    <div className="fixed top-0 navbar bg-base-100 min-h-0 flex-shrink-0 justify-between z-20 shadow-md shadow-primary px-0 sm:px-2">
      <div className="navbar-start w-auto lg:w-1/2">
        {/* Mobile menu */}
        <div
          className={`lg:hidden dropdown ${isDrawerOpen ? "dropdown-open" : ""}`}
          ref={burgerMenuRef}
        >
          <button
            type="button"
            aria-label="Open menu"
            aria-expanded={isDrawerOpen}
            className={`ml-1 btn btn-ghost ${isDrawerOpen ? "hover:bg-secondary" : "hover:bg-transparent"}`}
            onClick={(e) => {
              e.stopPropagation(); // évite la fermeture immédiate par le hook outside-click
              setIsDrawerOpen(prev => !prev);
            }}
          >
            <Bars3Icon className="w-6 h-6" />
          </button>

          <ul
            tabIndex={0}
            className="menu menu-compact dropdown-content mt-3 p-2 shadow bg-base-100 rounded-box w-52 z-50"
            onClick={() => {
              // Au clic sur un lien, on ferme
              setIsDrawerOpen(false);
            }}
          >
            <HeaderMenuLinks />
          </ul>
        </div>

        {/* Desktop logo + links */}
        <Link href="/" passHref className="hidden lg:flex items-center gap-2 ml-4 mr-6 shrink-0">
          <div className="flex flex-col">
            <span className="font-bold leading-tight">Alexis Balayre</span>
            <span className="text-xs">AI Engineer</span>
          </div>
        </Link>
        <ul className="hidden lg:flex lg:flex-nowrap menu menu-horizontal px-1 gap-2">
          <HeaderMenuLinks />
        </ul>
      </div>

      {/* Contact icons */}
      <div className="flex text-center pr-10">
        <a
          href="tel:+33695831470"
          target="_blank"
          rel="noopener noreferrer"
          className="transition flex text-neutral-content hover:text-primary-content pr-10"
          aria-label="Phone number of Alexis Balayre"
        >
          <PhoneIcon className="w-6 h-6" />
        </a>
        <a
          href="mailto:alexis@balayre.com"
          target="_blank"
          rel="noopener noreferrer"
          className="transition flex text-neutral-content hover:text-primary-content pr-10"
          aria-label="Email of Alexis Balayre"
        >
          <EnvelopeIcon className="w-6 h-6" />
        </a>
        <a
          href="https://calendly.com/alexis-balayre"
          target="_blank"
          rel="noopener noreferrer"
          className="transition flex text-neutral-content hover:text-primary-content"
          aria-label="Calendly of Alexis Balayre"
        >
          <CalendarIcon className="w-6 h-6" />
        </a>
      </div>
    </div>
  );
};
