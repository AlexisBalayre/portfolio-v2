// components/Timeline.tsx
import React from "react";
import Image from "next/image";

interface TimelineItem {
  logo: string;
  title: string;
  period: string;
  description: string;
}

interface TimelineProps {
  items: TimelineItem[];
}

// Titles read "<role> at <organisation>" or "<school> - <degree>"; the alt names the organisation.
const logoAlt = (title: string): string => {
  const text = title.replace(/<[^>]*>/g, "").trim();
  const atIndex = text.lastIndexOf(" at ");
  const dashIndex = text.indexOf(" - ");
  const organisation = atIndex !== -1 ? text.slice(atIndex + 4) : dashIndex !== -1 ? text.slice(0, dashIndex) : text;
  return `${organisation} logo`;
};

const TimelineCard = ({ item }: { item: TimelineItem }) => (
  <article className="content bg-base-100 ring-offset-white ring-offset-1/2 ring-white/20 ring-1">
    <div className="flex items-center space-x-4">
      <Image
        src={"/assets/img/" + item.logo}
        alt={logoAlt(item.title)}
        className="w-14 text-white"
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

const Timeline: React.FC<TimelineProps> = ({ items }) => {
  return (
    <div className="container mx-auto">
      <div className="flex justify-center">
        <div className="timeline md:block hidden">
          <ul className="list-none m-0 p-0">
            {items.map((item, index) => (
              <li key={index} className="mb-12">
                <div className={`containerBis ${index % 2 === 0 ? "right" : "left"}`}>
                  <TimelineCard item={item} />
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
                  <TimelineCard item={item} />
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
