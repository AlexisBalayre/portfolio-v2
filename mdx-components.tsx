// mdx-components.tsx
// The HTML elements MDX posts compile to, styled with daisyUI tokens so posts look native.
// Keep this list in sync with the allowed MDX in docs/conventions/content.md.
import React from "react";
import Image from "next/image";
import Link from "next/link";
import type { MDXComponents } from "mdx/types";

const linkClass = "font-bold text-primary hover:text-primary-content";

const isInternalHref = (href: string) => (href.startsWith("/") && !href.startsWith("//")) || href.startsWith("#");

// target and rel come last so a post cannot override them and drop noopener on an external link.
const MdxLink = ({ href = "", children, ...props }: React.ComponentPropsWithoutRef<"a">) =>
  isInternalHref(href) ? (
    <Link href={href} className={linkClass} {...props}>
      {children}
    </Link>
  ) : (
    <a href={href} className={linkClass} {...props} target="_blank" rel="noopener noreferrer">
      {children}
    </a>
  );

// next-mdx-remote strips JSX expressions (blockJS), so posts pass width and height as strings.
const MdxImage = ({ width, height, alt = "", ...props }: React.ComponentProps<typeof Image>) => (
  <Image width={Number(width)} height={Number(height)} alt={alt} {...props} />
);

export const mdxComponents: MDXComponents = {
  h2: props => <h2 className="text-3xl font-bold mt-12 mb-4" {...props} />,
  h3: props => <h3 className="text-2xl font-semibold mt-8 mb-3" {...props} />,
  h4: props => <h4 className="text-xl font-semibold mt-6 mb-2" {...props} />,
  p: props => <p className="text-lg leading-relaxed text-left md:text-justify" {...props} />,
  a: MdxLink,
  ul: props => <ul className="list-disc pl-6 my-4 space-y-2 text-lg" {...props} />,
  ol: props => <ol className="list-decimal pl-6 my-4 space-y-2 text-lg" {...props} />,
  li: props => <li className="leading-relaxed" {...props} />,
  blockquote: props => (
    <blockquote className="border-l-4 border-primary pl-4 my-6 italic text-neutral-content" {...props} />
  ),
  pre: props => (
    <pre
      className="bg-base-100 ring-offset-white ring-offset-1/2 ring-white/20 ring-1 rounded-lg p-4 my-6 overflow-x-auto text-sm leading-relaxed [&_code]:bg-transparent [&_code]:p-0 [&_code]:text-inherit"
      {...props}
    />
  ),
  code: props => <code className="bg-base-100 rounded px-1.5 py-0.5 text-[0.9em] text-primary" {...props} />,
  hr: () => <div className="divider divider-neutral my-8" />,
  table: props => (
    <div className="overflow-x-auto my-6">
      <table className="table table-zebra text-base" {...props} />
    </div>
  ),
  th: props => <th className="text-base-content font-bold" {...props} />,
  td: props => <td className="align-top leading-relaxed" {...props} />,
  strong: props => <strong className="font-bold text-base-content" {...props} />,
  Image: MdxImage,
};
