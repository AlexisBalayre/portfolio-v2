import React from "react";
import Image from "next/image";
import Link from "next/link";
import type { Post } from "~~/lib/posts";

interface Project {
  id: string;
  name: string;
  description: string;
  url: string;
  technologies: string[];
  image: string;
}

interface ProjectsProps {
  items: Project[];
  posts: Post[];
}

const Projects = ({ items, posts }: ProjectsProps) => (
  <div className="container mx-auto w-full rounded-xl md:grid-cols-3 grid gap-8 md:gap-14">
    {items.map(project => {
      const relatedPosts = posts.filter(post => post.projects.includes(project.id));
      return (
        <article
          className="card bg-base-100 ring-offset-white ring-offset-1/2 ring-white/20 ring-1 shadow-xl mb-6 md:mb-0 scroll-mt-24"
          id={`project-${project.id}`}
          key={project.id}
        >
          <figure>
            <Image src={project.image} alt={`${project.name} project preview`} width={400} height={200} />
          </figure>
          <div className="card-body">
            <h3 className="card-title">{project.name}</h3>
            <p>{project.description}</p>
            <ul className="card-actions justify list-none m-0 p-0" aria-label="Technologies">
              {project.technologies.map(technology => (
                <li className="badge badge-outline badge-primary" key={technology}>
                  {technology}
                </li>
              ))}
            </ul>
            {relatedPosts.length > 0 && (
              <div className="mt-4">
                <h4 className="text-sm font-semibold text-neutral-content">Read more on the blog</h4>
                <ul className="list-none m-0 p-0 text-sm space-y-1" aria-label={`Posts about ${project.name}`}>
                  {relatedPosts.map(post => (
                    <li key={post.slug}>
                      <Link href={`/blog/${post.slug}`} className="font-bold text-primary hover:text-primary-content">
                        {post.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
          <a
            className="btn btn-primary"
            href={project.url}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`View ${project.name} on GitHub`}
          >
            View Project
          </a>
        </article>
      );
    })}
  </div>
);

export default Projects;
