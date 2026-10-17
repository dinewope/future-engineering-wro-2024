"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/", label: "Home" },
  { href: "/cards/all", label: "Cards", match: "/cards" },
  { href: "/lexicon", label: "Lexicon" },
];

export function NavLinks() {
  const path = usePathname();
  return (
    <ul className="flex items-center gap-1 text-sm font-medium">
      {LINKS.map((l) => {
        const active = l.match ? path.startsWith(l.match) : path === l.href;
        return (
          <li key={l.href}>
            <Link
              href={l.href}
              aria-current={active ? "page" : undefined}
              className={`inline-flex min-h-11 items-center rounded-full px-3 transition-colors ${active ? "bg-ink text-paper" : "text-ink-soft hover:bg-card hover:text-ink"}`}
            >
              {l.label}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
