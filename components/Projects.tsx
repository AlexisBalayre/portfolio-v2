import React from "react";
import Image from "next/image";
import Link from "next/link";
import { fill, getDictionary, localePath, type Locale } from "~~/lib/i18n";
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
  locale: Locale;
}

const Projects = ({ items, posts, locale }: ProjectsProps) => {
  const t = getDictionary(locale);

  return (
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
              <Image
                src={project.image}
                alt={fill(t.projects.previewAlt, { name: project.name })}
                width={400}
                height={200}
              />
            </figure>
            <div className="card-body">
              <h3 className="card-title">{project.name}</h3>
              <p>{project.description}</p>
              <ul className="card-actions justify list-none m-0 p-0" aria-label={t.projects.technologies}>
                {project.technologies.map(technology => (
                  <li className="badge badge-outline badge-primary" key={technology}>
                    {technology}
                  </li>
                ))}
              </ul>
              {relatedPosts.length > 0 && (
                <div className="mt-4">
                  <h4 className="text-sm font-semibold text-neutral-content">{t.projects.readMore}</h4>
                  <ul
                    className="list-none m-0 p-0 text-sm space-y-1"
                    aria-label={fill(t.projects.postsAbout, { name: project.name })}
                  >
                    {relatedPosts.map(post => (
                      <li key={post.slug}>
                        <Link
                          href={localePath(locale, `/blog/${post.slug}`)}
                          className="font-bold text-primary hover:text-primary-content"
                        >
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
              title={fill(t.projects.viewAria, { name: project.name })}
            >
              {t.projects.view}
            </a>
          </article>
        );
      })}
    </div>
  );
};

export default Projects;
