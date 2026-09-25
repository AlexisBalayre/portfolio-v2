// app/[locale]/opengraph-image.tsx
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { defaultLocale, getDictionary, locales, toLocale } from "~~/lib/i18n";

// The alt is one static export per file, so it reads in the default locale.
export const alt = getDictionary(defaultLocale).og.homeAlt;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export const dynamicParams = false;

export function generateStaticParams() {
  return locales.map(locale => ({ locale }));
}

export default async function OpenGraphImage({ params }: { params: Promise<{ locale: string }> }) {
  const t = getDictionary(toLocale((await params).locale));
  const photo = await readFile(join(process.cwd(), "public/assets/img/alexis.jpg"));
  const photoSrc = `data:image/jpeg;base64,${photo.toString("base64")}`;

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "72px 96px",
        background: "linear-gradient(135deg, #000000 0%, #0f1729 100%)",
        color: "#ffffff",
        fontFamily: "sans-serif",
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", maxWidth: 720 }}>
        <div style={{ fontSize: 28, letterSpacing: 4, textTransform: "uppercase", color: "#38bdf8" }}>
          {t.profile.jobTitle}
        </div>
        <div style={{ fontSize: 84, fontWeight: 700, lineHeight: 1.05, marginTop: 16 }}>Alexis Balayre</div>
        <div style={{ fontSize: 32, color: "#cbd5e1", marginTop: 28, lineHeight: 1.3 }}>{t.og.tagline}</div>
        <div style={{ fontSize: 26, color: "#94a3b8", marginTop: 16 }}>{t.og.subtitle}</div>
        <div style={{ fontSize: 26, color: "#38bdf8", marginTop: 48 }}>alexis.balayre.com</div>
      </div>
      <img
        src={photoSrc}
        width={300}
        height={300}
        alt=""
        style={{ borderRadius: "50%", objectFit: "cover", border: "6px solid #38bdf8" }}
      />
    </div>,
    { ...size },
  );
}
