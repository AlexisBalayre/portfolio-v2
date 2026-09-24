// app/blog/[slug]/opengraph-image.tsx
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { formatPostDate, getAllPosts, getPost } from "~~/lib/posts";

export const alt = "Blog post by Alexis Balayre, AI Engineer";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export async function generateStaticParams() {
  const posts = await getAllPosts();
  return posts.map(({ slug }) => ({ slug }));
}

export default async function OpenGraphImage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { post } = await getPost(slug);
  const photo = await readFile(join(process.cwd(), "public/assets/img/alexis.jpg"));
  const photoSrc = `data:image/jpeg;base64,${photo.toString("base64")}`;

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "64px 96px",
        background: "linear-gradient(135deg, #000000 0%, #0f1729 100%)",
        color: "#ffffff",
        fontFamily: "sans-serif",
      }}
    >
      <div style={{ display: "flex", flexDirection: "column" }}>
        <div style={{ fontSize: 28, letterSpacing: 4, textTransform: "uppercase", color: "#38bdf8" }}>Blog</div>
        <div
          style={{
            fontSize: post.title.length > 60 ? 52 : 64,
            fontWeight: 700,
            lineHeight: 1.1,
            marginTop: 20,
            maxWidth: 1000,
          }}
        >
          {post.title}
        </div>
        <div style={{ fontSize: 28, color: "#cbd5e1", marginTop: 24, lineHeight: 1.35, maxWidth: 960 }}>
          {post.description.length > 160 ? `${post.description.slice(0, 157).trimEnd()}...` : post.description}
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", flexDirection: "column", maxWidth: 680, marginRight: 48 }}>
          {/* Satori needs a single text node per element */}
          <div
            style={{ fontSize: 24, color: "#94a3b8" }}
          >{`${formatPostDate(post.date)} · ${post.tags.join(", ")}`}</div>
          <div style={{ fontSize: 26, color: "#38bdf8", marginTop: 12 }}>alexis.balayre.com/blog</div>
        </div>
        <div style={{ display: "flex", alignItems: "center", flexShrink: 0 }}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", marginRight: 24 }}>
            <div style={{ fontSize: 30, fontWeight: 700 }}>Alexis Balayre</div>
            <div style={{ fontSize: 22, color: "#94a3b8" }}>AI Engineer</div>
          </div>
          <img
            src={photoSrc}
            width={120}
            height={120}
            alt=""
            style={{ borderRadius: "50%", objectFit: "cover", border: "4px solid #38bdf8" }}
          />
        </div>
      </div>
    </div>,
    { ...size },
  );
}
