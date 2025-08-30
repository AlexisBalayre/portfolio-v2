import React from "react";

interface Category {
  name: string;
  skills: {
    name: string;
    percentage: number;
  }[];
}

interface SkillsProps {
  items: Category[];
}

const Skills = ({ items }: SkillsProps) => (
  <div className="container mx-auto px-4 rounded-xl lg:grid-cols-3 gap-8 bg-base-100 ring-offset-white ring-offset-1/2 ring-white/20 ring-1 p-6 md:w-4/6">
    {items.map(category => (
      <div key={category.name} className="skill-category md:mb-8 mb-6">
        <h3 className="text-xl font-semibold mb-4">{category.name}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2">
          {category.skills.map(skill => (
            <div key={skill.name} className="p-4">
              <h4 className="text-lg font-semibold mb-2">{skill.name}</h4>
              <div className="flex items-center">
                <progress
                  className="progress progress-primary w-full h-2 rounded-full overflow-hidden"
                  value={skill.percentage}
                  max="100"
                ></progress>
                <span className="text-sm ml-2">{skill.percentage}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    ))}
  </div>
);

export default Skills;
