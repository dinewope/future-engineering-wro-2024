import { useSyncExternalStore } from "react";

// In-memory router for the standalone build (a single-file page has no server
// to resolve /cards/... URLs). Mirrors the route into location.hash when allowed.
let path = readInitialPath();
const listeners = new Set<() => void>();

function readInitialPath(): string {
  try {
    const h = window.location.hash.replace(/^#/, "");
    return h.startsWith("/") ? h : "/";
  } catch {
    return "/";
  }
}

export function navigate(to: string): void {
  if (to === path) return;
  path = to;
  try {
    history.replaceState(null, "", `#${to}`);
  } catch {
    // Sandboxed frames may refuse history writes; in-memory routing still works.
  }
  window.scrollTo({ top: 0 });
  listeners.forEach((l) => l());
}

export function usePath(): string {
  return useSyncExternalStore(
    (l) => {
      listeners.add(l);
      return () => listeners.delete(l);
    },
    () => path,
    () => "/",
  );
}
