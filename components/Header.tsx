"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  AcademicCapIcon,
  Bars3Icon,
  BriefcaseIcon,
  CodeBracketIcon,
  NewspaperIcon,
  RocketLaunchIcon,
  TrophyIcon,
  UserIcon,
} from "@heroicons/react/24/outline";
import { CalendarIcon, EnvelopeIcon } from "@heroicons/react/24/solid";
import { useOutsideClick } from "~~/hooks";
import { getDictionary, localePath, locales, stripLocale, type Dictionary, type Locale } from "~~/lib/i18n";

interface HeaderMenuLink {
  label: keyof Dictionary["nav"];
  section: string;
  icon?: React.ReactNode;
}

export const menuLinks: HeaderMenuLink[] = [
  {
    label: "aboutMe",
    section: "aboutMe",
    icon: <UserIcon className="h-4 w-4" />,
  },
  {
    label: "experiences",
    section: "experiences",
    icon: <BriefcaseIcon className="h-4 w-4" />,
  },
  {
    label: "projects",
    section: "projects",
    icon: <TrophyIcon className="h-4 w-4" />,
  },
  {
    label: "skills",
    section: "skills",
    icon: <CodeBracketIcon className="h-4 w-4" />,
  },
  {
    label: "hackathons",
    section: "hackathons",
    icon: <RocketLaunchIcon className="h-4 w-4" />,
  },
  {
    label: "education",
    section: "education",
    icon: <AcademicCapIcon className="h-4 w-4" />,
  },
];

// The blog is the only route outside the home page; it is listed after the sections.
const blogLink = { label: "blog" as const, path: "/blog", icon: <NewspaperIcon className="h-4 w-4" /> };

const menuLinkClass = (isActive: boolean) =>
  `${
    isActive ? "bg-primary shadow-md text-accent-content" : ""
  } hover:bg-secondary hover:shadow-md cursor-pointer focus:!bg-accent active:!text-neutral py-1.5 px-3 text-sm rounded-full gap-2 grid grid-flow-col`;

interface HeaderMenuLinksProps {
  locale: Locale;
}

export const HeaderMenuLinks = ({ locale }: HeaderMenuLinksProps) => {
  const t = getDictionary(locale);
  const pathname = stripLocale(usePathname());
  const isHome = pathname === "/";
  const isBlog = pathname === blogLink.path || pathname.startsWith(`${blogLink.path}/`);
  const home = localePath(locale);
  const [isActive, setIsActive] = useState({
    aboutMe: true,
    education: false,
    experiences: false,
    hackathons: false,
    skills: false,
    projects: false,
  });

  const checkVisibility = useCallback(() => {
    let closestSection: string | null = null;

    menuLinks.forEach(({ section }) => {
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
      hackathons: closestSection === "hackathons",
      skills: closestSection === "skills",
      projects: closestSection === "projects",
    });
  }, []);

  useEffect(() => {
    // Vérifie à l'init, à chaque changement de route (retour du blog) puis sur scroll
    checkVisibility();
    window.addEventListener("scroll", checkVisibility, { passive: true });
    return () => {
      window.removeEventListener("scroll", checkVisibility);
    };
  }, [checkVisibility, pathname]);

  return (
    <>
      {menuLinks.map(({ label, section, icon }) => (
        <li key={section}>
          {/* Section anchors only exist on the home page; elsewhere the link goes back to it first */}
          <Link
            href={isHome ? `#${section}` : `${home}#${section}`}
            aria-current={isHome && isActive[section as keyof typeof isActive] ? "location" : undefined}
            className={menuLinkClass(isHome && isActive[section as keyof typeof isActive])}
          >
            {icon}
            <span>{t.nav[label]}</span>
          </Link>
        </li>
      ))}
      <li key={blogLink.path}>
        <Link
          href={localePath(locale, blogLink.path)}
          aria-current={isBlog ? "page" : undefined}
          className={menuLinkClass(isBlog)}
        >
          {blogLink.icon}
          <span>{t.nav[blogLink.label]}</span>
        </Link>
      </li>
    </>
  );
};

interface LanguageSwitchProps {
  locale: Locale;
  postLocales: Record<string, Locale[]>;
}

// Links to the same page in the other locale, or to that locale's blog list for a post it does not have.
const LanguageSwitch = ({ locale, postLocales }: LanguageSwitchProps) => {
  const t = getDictionary(locale);
  const pathname = stripLocale(usePathname());
  const target = locales.find(candidate => candidate !== locale) ?? locale;
  const slug = pathname.match(/^\/blog\/([^/]+)$/)?.[1];
  const isUntranslated = slug !== undefined && !(postLocales[slug] ?? []).includes(target);
  const href = localePath(target, isUntranslated ? blogLink.path : pathname);

  return (
    <Link
      href={href}
      hrefLang={target}
      lang={target}
      className="transition text-sm font-bold text-neutral-content hover:text-primary-content pr-10"
      aria-label={t.header.switchLocaleAria}
    >
      {t.header.switchLocale}
    </Link>
  );
};

interface HeaderProps {
  locale: Locale;
  // slug -> locales that have their own file, so the language switch can skip untranslated posts.
  postLocales: Record<string, Locale[]>;
}

/**
 * Site header
 */
export const Header = ({ locale, postLocales }: HeaderProps) => {
  const t = getDictionary(locale);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const burgerMenuRef = useRef<HTMLDivElement>(null) as React.RefObject<HTMLDivElement>;

  useOutsideClick(
    burgerMenuRef,
    useCallback(() => setIsDrawerOpen(false), []),
  );

  return (
    <header className="fixed top-0 navbar bg-base-100 min-h-0 flex-shrink-0 justify-between z-20 shadow-md shadow-primary px-0 sm:px-2">
      <div className="navbar-start w-auto lg:w-1/2">
        {/* Mobile menu */}
        <div className={`lg:hidden dropdown ${isDrawerOpen ? "dropdown-open" : ""}`} ref={burgerMenuRef}>
          <button
            type="button"
            aria-label={t.header.openMenu}
            aria-expanded={isDrawerOpen}
            className={`ml-1 btn btn-ghost ${isDrawerOpen ? "hover:bg-secondary" : "hover:bg-transparent"}`}
            onClick={e => {
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
            <HeaderMenuLinks locale={locale} />
          </ul>
        </div>

        {/* Desktop logo + links */}
        <Link href={localePath(locale)} passHref className="hidden lg:flex items-center gap-2 ml-4 mr-6 shrink-0">
          <div className="flex flex-col">
            <span className="font-bold leading-tight">Alexis Balayre</span>
            <span className="text-xs">{t.profile.jobTitle}</span>
          </div>
        </Link>
        <nav aria-label={t.header.primaryNav} className="hidden lg:flex">
          <ul className="flex flex-nowrap menu menu-horizontal px-1 gap-2">
            <HeaderMenuLinks locale={locale} />
          </ul>
        </nav>
      </div>

      {/* Language switch + contact icons */}
      <div className="flex items-center text-center pr-10">
        <LanguageSwitch locale={locale} postLocales={postLocales} />
        <a
          href="mailto:alexis@balayre.com"
          target="_blank"
          rel="noopener noreferrer"
          className="transition flex text-neutral-content hover:text-primary-content pr-10"
          aria-label={t.header.emailAria}
        >
          <EnvelopeIcon className="w-6 h-6" />
        </a>
        <a
          href="https://calendly.com/alexis-balayre"
          target="_blank"
          rel="noopener noreferrer"
          className="transition flex text-neutral-content hover:text-primary-content"
          aria-label={t.header.calendlyAria}
        >
          <CalendarIcon className="w-6 h-6" />
        </a>
      </div>
    </header>
  );
};
