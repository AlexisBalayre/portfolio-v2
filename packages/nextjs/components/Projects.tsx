import React from "react";
import Image from "next/image";

interface Project {
  name: string;
  description: string;
  url: string;
  technologies: string[];
  image: string;
}

interface ProjectsProps {
  items: Project[];
}

const Projects = ({ items }: ProjectsProps) => (
  <div className="container mx-auto w-full rounded-xl md:grid-cols-3 grid gap-8 md:gap-14">
    {items.map(project => (
      <div
        className="card bg-base-100 ring-offset-white ring-offset-1/2 ring-white/20 ring-1 shadow-xl mb-6 md:mb-0"
        key={project.name}
      >
        <figure>
          <Image src={project.image} alt="Project Banner" width={400} height={200} />
        </figure>
        <div className="card-body">
          <h2 className="card-title">{project.name}</h2>
          <p>{project.description}</p>
          <div className="card-actions justify">
            {project.technologies.map(technology => (
              <div className="badge badge-outline badge-primary" key={technology}>
                {technology}
              </div>
            ))}
          </div>
        </div>
        <a className="btn btn-primary" href={project.url} target="_blank" rel="noreferrer">
          View Project
        </a>
      </div>
    ))}
  </div>
);

export default Projects;
