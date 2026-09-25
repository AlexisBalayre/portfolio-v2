// components/Timeline.tsx
import React from "react";
import Image from "next/image";
import { fill, getDictionary, type Dictionary, type Locale } from "~~/lib/i18n";

interface TimelineItem {
  logo: string;
  title: string;
  period: string;
  description: string;
}

interface TimelineProps {
  items: TimelineItem[];
  locale: Locale;
}

// Titles read "<school> - <degree>" or "<role> <separator> <organisation>", the separator being the
// locale's word for "at"; the alt names the organisation.
const logoAlt = (title: string, t: Dictionary["timeline"]): string => {
  const text = title.replace(/<[^>]*>/g, "").trim();
  const dashIndex = text.indexOf(" - ");
  const separatorIndex = Math.max(...t.organisationSeparators.map(separator => text.lastIndexOf(separator)));
  const separator = t.organisationSeparators.find(candidate => text.lastIndexOf(candidate) === separatorIndex) ?? "";
  const organisation =
    dashIndex !== -1
      ? text.slice(0, dashIndex)
      : separatorIndex !== -1
        ? text.slice(separatorIndex + separator.length)
        : text;
  return fill(t.logoAlt, { organisation });
};

const TimelineCard = ({ item, locale }: { item: TimelineItem; locale: Locale }) => (
  <article className="content bg-base-100 ring-offset-white ring-offset-1/2 ring-white/20 ring-1">
    <div className="flex items-center space-x-4">
      <Image
        src={"/assets/img/" + item.logo}
        alt={logoAlt(item.title, getDictionary(locale).timeline)}
        className="w-14 h-14 object-contain text-white"
        width={56}
        height={56}
      />
      <div>
        <h3 className="text-lg md:text-xl font-semibold" dangerouslySetInnerHTML={{ __html: item.title }}></h3>
        <span className="text-sm font-semibold">{item.period}</span>
      </div>
    </div>
    <p className="mt-2 text-lg text-left md:text-justify" dangerouslySetInnerHTML={{ __html: item.description }}></p>
  </article>
);

const Timeline: React.FC<TimelineProps> = ({ items, locale }) => {
  return (
    <div className="container mx-auto">
      <div className="flex justify-center">
        <div className="timeline md:block hidden">
          <ul className="list-none m-0 p-0">
            {items.map((item, index) => (
              <li key={index} className="mb-12">
                <div className={`containerBis ${index % 2 === 0 ? "right" : "left"}`}>
                  <TimelineCard item={item} locale={locale} />
                </div>
              </li>
            ))}
          </ul>
        </div>
        <div className="md:hidden">
          <ul className="list-none m-0 p-0">
            {items.map((item, index) => (
              <li key={index} className="mb-12">
                <div className={`${index % 2 === 0 ? "right" : "left"}`}>
                  <TimelineCard item={item} locale={locale} />
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Timeline;
