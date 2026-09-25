// app/not-found.tsx
import React from "react";
import "~~/styles/globals.css";
import { Footer } from "~~/components/Footer";
import { Header } from "~~/components/Header";
import { NotFound } from "~~/components/NotFound";
import { defaultLocale } from "~~/lib/i18n";

// The one 404 page, prerendered as /_not-found and served for every URL the router refuses (unknown locale,
// unknown slug, anything under /fr that is not a route). It renders its own document because the locale
// layout is never reached. A notFound() thrown at request time is not used anywhere: in this Next version the
// server answers it with a bare error document and renders the styled page only on the client.
export default function RootNotFound() {
  return (
    <html lang={defaultLocale}>
      <body className="flex flex-col min-h-screen">
        <Header locale={defaultLocale} postLocales={{}} />
        <main className="flex-1">
          <NotFound />
        </main>
        <Footer locale={defaultLocale} />
      </body>
    </html>
  );
}
