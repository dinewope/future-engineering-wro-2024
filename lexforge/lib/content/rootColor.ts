/** Stable color slot (0–7) per root id, so a root looks the same everywhere. */
export function rootColorClass(rootId: string): string {
  let h = 0;
  for (const ch of rootId) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return `root-c${h % 8}`;
}

export interface Segment {
  text: string;
  rootId?: string;
}

/** Splits a lemma into plain and root segments: mitigate → miti · gate. */
export function segmentLemma(lemma: string, parts: { rootId: string; part: string }[]): Segment[] {
  const lower = lemma.toLowerCase();
  const spans = parts
    .map((p) => ({ ...p, start: lower.indexOf(p.part.toLowerCase()) }))
    .filter((p) => p.start >= 0)
    .sort((a, b) => a.start - b.start);
  const out: Segment[] = [];
  let cursor = 0;
  for (const s of spans) {
    if (s.start < cursor) continue; // overlapping parts: keep the first
    if (s.start > cursor) out.push({ text: lemma.slice(cursor, s.start) });
    out.push({ text: lemma.slice(s.start, s.start + s.part.length), rootId: s.rootId });
    cursor = s.start + s.part.length;
  }
  if (cursor < lemma.length) out.push({ text: lemma.slice(cursor) });
  return out;
}
