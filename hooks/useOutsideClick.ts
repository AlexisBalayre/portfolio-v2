import { useEffect } from "react";

export function useOutsideClick<T extends HTMLElement>(
  ref: React.RefObject<T>,
  handler: (e: Event) => void,
) {
  useEffect(() => {
    const listener = (e: Event) => {
      const el = ref.current;
      if (!el) return;
      if (el.contains(e.target as Node)) return; // clic à l’intérieur => on ignore
      handler(e);
    };

    // pointerdown gère souris + tactile, évite les doubles événements mobile
    document.addEventListener("pointerdown", listener, { capture: true });
    return () => {
      document.removeEventListener("pointerdown", listener as EventListener, { capture: true } as any);
    };
  }, [ref, handler]);
}
