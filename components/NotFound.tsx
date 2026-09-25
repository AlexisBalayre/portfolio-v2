"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import { defaultLocale, getDictionary, isLocale, localePath, type Locale } from "~~/lib/i18n";

/**
 * The 404 body. Next serves one prerendered not-found page for every unknown URL, so the locale is read from
 * the address after mount: the server HTML is English, /fr/* paths switch to French once hydrated.
 */
export const NotFound = () => {
  const [locale, setLocale] = useState<Locale>(defaultLocale);
  const t = getDictionary(locale);

  useEffect(() => {
    const [, first] = window.location.pathname.split("/");
    if (!isLocale(first)) return;
    setLocale(first);
    document.documentElement.lang = first;
  }, []);

  return (
    <div className="pt-10 mx-auto w-full mt-20">
      <div className="px-5">
        <section className="mx-auto container max-w-3xl" aria-labelledby="not-found-heading">
          <p className="text-sm font-semibold text-neutral-content mb-2">404</p>
          <h1 id="not-found-heading" className="text-4xl md:text-5xl font-bold text-primary leading-tight">
            {t.notFound.title}
          </h1>
          <p className="text-lg text-neutral-content mt-4">{t.notFound.description}</p>
          <Link
            href={localePath(locale)}
            className="inline-flex items-center gap-2 mt-8 text-sm font-bold text-primary hover:text-primary-content"
          >
            <ArrowLeftIcon className="h-4 w-4" />
            {t.notFound.backHome}
          </Link>
        </section>
      </div>
    </div>
  );
};
