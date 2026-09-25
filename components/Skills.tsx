import React from "react";
import { getDictionary, type Locale } from "~~/lib/i18n";

type Tier = "Core" | "Working" | "Familiar";

interface Category {
  name: string;
  skills: {
    name: string;
    tier: string;
  }[];
}

interface SkillsProps {
  items: Category[];
  locale: Locale;
}

// The tier values in tech.json are keys; their label and description come from the dictionary.
const TIERS: { tier: Tier; key: "core" | "working" | "familiar"; badgeClass: string }[] = [
  { tier: "Core", key: "core", badgeClass: "badge-primary" },
  { tier: "Working", key: "working", badgeClass: "badge-secondary" },
  { tier: "Familiar", key: "familiar", badgeClass: "badge-ghost" },
];

const Skills = ({ items, locale }: SkillsProps) => {
  const t = getDictionary(locale);

  return (
    <div className="container mx-auto px-4 rounded-xl gap-8 bg-base-100 ring-offset-white ring-offset-1/2 ring-white/20 ring-1 p-6 md:w-4/6">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mb-8 text-xs text-neutral-content">
        {TIERS.map(({ tier, key, badgeClass }) => (
          <span key={tier} className="flex items-center gap-2">
            <span className={`badge badge-sm ${badgeClass}`}>{t.skills[key].label}</span>
            <span>{t.skills[key].description}</span>
          </span>
        ))}
      </div>

      {items.map(category => (
        <div key={category.name} className="skill-category md:mb-8 mb-6">
          <h3 className="text-xl font-semibold mb-4">{category.name}</h3>
          <div className="space-y-3">
            {TIERS.map(({ tier, key, badgeClass }) => {
              const skills = category.skills.filter(skill => skill.tier === tier);
              if (skills.length === 0) return null;
              return (
                <div key={tier} className="flex flex-col sm:flex-row sm:items-start gap-2">
                  <span className={`badge ${badgeClass} shrink-0 w-24 justify-center`}>{t.skills[key].label}</span>
                  <div className="flex flex-wrap gap-2">
                    {skills.map(skill => (
                      <span key={skill.name} className="badge badge-outline">
                        {skill.name}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};

export default Skills;
