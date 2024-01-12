import React from "react";

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
  <div className="container mx-auto rounded-xl md:grid-cols-3 md:flex gap-8 md:gap-0">
    {items.map(project => (
      <div
        className="card bg-base-100 ring-offset-white ring-offset-1/2 ring-white/20 ring-1 shadow-xl md:ml-5 md:mr-5 md:w-1/3 mb-6 md:mb-0"
        key={project.name}
      >
        <figure>
          <img src={project.image} alt="Shoes" />
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
