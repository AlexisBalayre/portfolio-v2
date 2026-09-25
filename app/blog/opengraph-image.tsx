// app/blog/opengraph-image.tsx
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { blogDescription, blogTitle } from "~~/lib/site";

export const alt = "The blog of Alexis Balayre, AI Engineer";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpenGraphImage() {
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
        <div style={{ fontSize: 28, letterSpacing: 4, textTransform: "uppercase", color: "#38bdf8" }}>
          alexis.balayre.com
        </div>
        <div style={{ fontSize: 84, fontWeight: 700, lineHeight: 1.05, marginTop: 16 }}>{blogTitle}</div>
        <div style={{ fontSize: 30, color: "#cbd5e1", marginTop: 28, lineHeight: 1.35, maxWidth: 960 }}>
          {blogDescription}
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end" }}>
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
    </div>,
    { ...size },
  );
}
