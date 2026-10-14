import type { TimelineEvent } from './types';

/** Patient words -> structured terms. Plain lookup, no model: every match links back to its source. */
const LEXICON: { pattern: RegExp; term: string; lang?: string }[] = [
  { pattern: /itchy bumps?/i, term: 'Wheals' },
  { pattern: /welts?/i, term: 'Wheals' },
  { pattern: /ronchas/i, term: 'Wheals', lang: 'ES' },
  { pattern: /\bhives\b/i, term: 'Wheals' },
  { pattern: /lips? puffed up|lip swelling/i, term: 'Swelling (lips)' },
  { pattern: /ojos hinchados/i, term: 'Swelling (eyelids)', lang: 'ES' },
  { pattern: /hands? swell(ed)? up|hands? swollen/i, term: 'Swelling (hands)' },
  { pattern: /couldn'?t sleep|awake at \d+ ?am|poor sleep/i, term: 'Sleep disrupted' },
  { pattern: /scratching|so itchy|itching/i, term: 'Itch' },
  { pattern: /\brash\b/i, term: 'Skin rash (unspecified; check for wheals)' },
  { pattern: /missed (my|class)[a-z ]*/i, term: 'Missed class or plans' },
];

export interface TermMatch {
  phrase: string;
  term: string;
  lang?: string;
  events: TimelineEvent[];
}

export function extractTerms(events: TimelineEvent[]): TermMatch[] {
  const map = new Map<string, TermMatch>();
  for (const e of events) {
    for (const { pattern, term, lang } of LEXICON) {
      const m = e.text.match(pattern);
      if (!m) continue;
      const phrase = m[0].toLowerCase().trim();
      const key = `${phrase}|${term}`;
      const hit = map.get(key) ?? { phrase, term, lang, events: [] };
      hit.events.push(e);
      map.set(key, hit);
    }
  }
  return [...map.values()].sort((a, b) => b.events.length - a.events.length);
}
