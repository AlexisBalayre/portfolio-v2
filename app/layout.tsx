// app/layout.tsx
import type { ReactNode } from "react";

// The document is owned by app/[locale]/layout.tsx (html lang per locale) and, for URLs the router
// refuses, by app/not-found.tsx. Without this pass-through root layout Next.js wraps the 404 in a
// second, bare <html> of its own.
export default function RootLayout({ children }: { children: ReactNode }) {
  return children;
}
