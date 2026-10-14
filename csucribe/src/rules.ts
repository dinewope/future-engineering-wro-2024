/**
 * Pattern Flag: a transparent, rule-based stand-in for the "AI" in the prototype.
 *
 * Every rule returns the reason it fired and the events that made it fire, so a
 * clinician can check each point against its source. The rules never produce a
 * diagnosis, a probability or a treatment; the strongest output is "Review suggested".
 *
 * The emergency safety stop is deliberately NOT here. It is hard-coded in the
 * patient form (see safety.ts) and an emergency entry never reaches this engine.
 */
import type { RuleResult, TimelineEvent } from './types';

export const SIX_WEEKS_DAYS = 42;
export const TWELVE_MONTHS_DAYS = 365;
export const UCT_WELL_CONTROLLED = 12;

export type EvidenceStrength = 'Strong' | 'Limited';

const byDay = (a: TimelineEvent, b: TimelineEvent) => a.day - b.day;

export function upTo(events: TimelineEvent[], asOfDay = Infinity): TimelineEvent[] {
  return events.filter((e) => e.day <= asOfDay).sort(byDay);
}

/** True when an event records hives (wheals) or swelling. */
export function hasHivesOrSwelling(e: TimelineEvent): boolean {
  return e.hives === true || (e.wheals ?? 0) > 0 || (e.swelling?.length ?? 0) > 0;
}

/** Whether an event says anything at all about hives (present or absent). */
function reportsHives(e: TimelineEvent): boolean {
  return e.hives !== undefined || e.wheals !== undefined || (e.swelling?.length ?? 0) > 0;
}

const uniqueDays = (events: TimelineEvent[]) => [...new Set(events.map((e) => e.day))];

const isVisit = (e: TimelineEvent) => e.setting !== 'checkin';

/** 1. Time rule: hives or swelling on 2+ dates spanning at least 6 weeks. */
export function timeRule(events: TimelineEvent[], asOfDay = Infinity): RuleResult {
  const hits = upTo(events, asOfDay).filter(hasHivesOrSwelling);
  const days = uniqueDays(hits);
  const span = days.length ? Math.max(...days) - Math.min(...days) : 0;
  const weeks = Math.floor(span / 7);
  const fired = days.length >= 2 && span >= SIX_WEEKS_DAYS;
  return {
    id: 'time',
    name: 'Time rule',
    fired,
    reason: fired
      ? `Hives/swelling recorded on ${days.length} dates over ${weeks} weeks.`
      : `Hives/swelling recorded on ${days.length} date${days.length === 1 ? '' : 's'} over ${weeks} weeks (rule needs 6+ weeks).`,
    evidence: fired ? hits : [],
  };
}

/** 2. Fragmentation rule: same complaint in 3+ visits, or in 2+ care settings, within 12 months. */
export function fragmentationRule(events: TimelineEvent[], asOfDay = Infinity): RuleResult {
  const vs = upTo(events, asOfDay).filter((e) => isVisit(e) && e.complaint);
  let best: TimelineEvent[] = [];
  for (const start of vs) {
    const window = vs.filter(
      (v) => v.complaint === start.complaint && v.day >= start.day && v.day - start.day <= TWELVE_MONTHS_DAYS,
    );
    const settings = new Set(window.map((v) => v.setting));
    const qualifies = window.length >= 3 || settings.size >= 2;
    if (qualifies && window.length > best.length) best = window;
  }
  const fired = best.length > 0;
  const settings = new Set(best.map((v) => v.setting));
  return {
    id: 'fragmentation',
    name: 'Fragmentation rule',
    fired,
    reason: fired
      ? `Same complaint ("${best[0].complaint}") in ${best.length} visits across ${settings.size} care settings within 12 months.`
      : 'No repeated complaint across visits or settings within 12 months.',
    evidence: best,
  };
}

/** 3. Burden rule: UCT below 12 on two checks in a row, or sleep disrupted on 3+ check-ins within 7 days. */
export function burdenRule(events: TimelineEvent[], asOfDay = Infinity): RuleResult {
  const evs = upTo(events, asOfDay);
  const reasons: string[] = [];
  const evidence: TimelineEvent[] = [];

  const ucts = evs.filter((e) => e.uct !== undefined);
  for (let i = 1; i < ucts.length; i++) {
    const [a, b] = [ucts[i - 1], ucts[i]];
    if (a.uct! < UCT_WELL_CONTROLLED && b.uct! < UCT_WELL_CONTROLLED) {
      reasons.push(`Urticaria Control Test below 12 on two checks in a row (${a.uct} and ${b.uct}).`);
      evidence.push(a, b);
      break;
    }
  }

  const sleepy = evs.filter((e) => e.setting === 'checkin' && e.sleepDisrupted);
  for (let i = 0; i < sleepy.length; i++) {
    const week = sleepy.filter((e) => e.day >= sleepy[i].day && e.day - sleepy[i].day <= 6);
    if (week.length >= 3) {
      reasons.push(`Sleep disrupted on ${week.length} check-ins within 7 days.`);
      evidence.push(...week);
      break;
    }
  }

  const fired = reasons.length > 0;
  return {
    id: 'burden',
    name: 'Burden rule',
    fired,
    reason: fired ? reasons.join(' ') : 'Control test and sleep check-ins below the burden threshold.',
    evidence: evidence.sort(byDay),
  };
}

/** 4. Voice rule: the patient pressed "Please review my story". */
export function voiceRule(events: TimelineEvent[], asOfDay = Infinity): RuleResult {
  const asks = upTo(events, asOfDay).filter((e) => e.reviewRequested);
  const fired = asks.length > 0;
  return {
    id: 'voice',
    name: 'Voice rule',
    fired,
    reason: fired ? 'Elena asked: "Please review my story."' : 'Patient has not asked for a review.',
    evidence: asks,
  };
}

/** 5. Data rule: records on the same date disagree (hives present vs absent, or different swelling sites). */
export function dataRule(events: TimelineEvent[], asOfDay = Infinity): RuleResult {
  const evs = upTo(events, asOfDay);
  const conflicts: TimelineEvent[][] = [];
  for (const day of uniqueDays(evs)) {
    const same = evs.filter((e) => e.day === day && reportsHives(e));
    if (same.length < 2) continue;
    const present = same.filter(hasHivesOrSwelling);
    const absent = same.filter((e) => !hasHivesOrSwelling(e));
    const sites = same.filter((e) => e.swelling?.length).map((e) => e.swelling!.join(','));
    if ((present.length && absent.length) || new Set(sites).size > 1) conflicts.push(same);
  }
  const fired = conflicts.length > 0;
  const first = conflicts[0];
  return {
    id: 'data',
    name: 'Data rule',
    fired,
    reason: fired
      ? `Records disagree on day ${first[0].day} (${first.map((e) => e.source).join(' vs ')}); please check.`
      : 'No conflicting records found.',
    evidence: conflicts.flat(),
  };
}

export const RULES = [timeRule, fragmentationRule, burdenRule, voiceRule, dataRule];

export interface FlagResult {
  results: RuleResult[];
  fired: RuleResult[];
  reviewSuggested: boolean;
  strength: EvidenceStrength;
  datedEntries: number;
  photos: number;
}

/** Run every rule. "Strong" = 3+ rules fired, or many dated entries with photos. */
export function evaluate(events: TimelineEvent[], asOfDay = Infinity): FlagResult {
  const results = RULES.map((rule) => rule(events, asOfDay));
  const fired = results.filter((r) => r.fired);
  const evs = upTo(events, asOfDay);
  const datedEntries = uniqueDays(evs.filter(hasHivesOrSwelling)).length;
  const photos = evs.filter((e) => e.photo).length;
  const strong = fired.length >= 3 || (datedEntries >= 14 && photos >= 4);
  return {
    results,
    fired,
    reviewSuggested: fired.length > 0,
    strength: strong ? 'Strong' : 'Limited',
    datedEntries,
    photos,
  };
}

/** The first day on which any rule fires, or null if none ever does. */
export function firstFlagDay(events: TimelineEvent[]): number | null {
  for (const day of uniqueDays(upTo(events))) {
    if (evaluate(events, day).reviewSuggested) return day;
  }
  return null;
}

/**
 * The scenario switch on the clinician view.
 * "before" is today's care: separate visit notes, no CSUcribe, so nothing is evaluated.
 */
export function runScenario(mode: 'before' | 'after', events: TimelineEvent[], asOfDay = Infinity): FlagResult | null {
  return mode === 'after' ? evaluate(events, asOfDay) : null;
}

/** Compress [1,2,3,5] into "1–3, 5". */
export function formatRanges(nums: number[]): string {
  const out: string[] = [];
  let i = 0;
  while (i < nums.length) {
    let j = i;
    while (j + 1 < nums.length && nums[j + 1] === nums[j] + 1) j++;
    out.push(j > i ? `${nums[i]}–${nums[j]}` : `${nums[i]}`);
    i = j + 1;
  }
  return out.join(', ');
}

/** Gaps in the record a clinician may want to fill. */
export function missingInformation(events: TimelineEvent[], asOfDay = Infinity): string[] {
  const evs = upTo(events, asOfDay);
  const vs = evs.filter(isVisit);
  const checks = evs.filter((e) => !isVisit(e));
  const out: string[] = [];

  const swells = evs.filter((e) => e.swelling?.length);
  if (swells.length && swells.every((e) => e.swellingDurationHours === undefined)) {
    out.push(`No record of how long swelling episodes lasted (${swells.length} episode${swells.length === 1 ? '' : 's'} on file).`);
  }

  const photos = evs.filter((e) => e.photo);
  if (!photos.length) out.push('No photos on record. Hives usually fade within 24 hours, so the skin often looks clear at visits.');
  else if (photos.every((e) => !isVisit(e))) out.push('Photos only from patient check-ins; none taken at visits.');

  const noSleep = vs.map((v, i) => (v.sleepDisrupted === undefined ? i + 1 : 0)).filter(Boolean);
  if (noSleep.length) out.push(`Sleep impact not recorded at visit${noSleep.length === 1 ? '' : 's'} ${formatRanges(noSleep)}.`);

  if (!evs.some((e) => e.uct !== undefined)) out.push('No Urticaria Control Test on record.');

  if (!checks.length && vs.length > 1) {
    let gap = 0;
    for (let i = 1; i < vs.length; i++) gap = Math.max(gap, vs[i].day - vs[i - 1].day);
    out.push(`No symptom record between visits (longest gap: ${Math.round(gap / 30.44)} months).`);
  }

  out.push('Possible outside triggers (foods, soaps, medicines, infections) asked about only at visit 1.');
  return out;
}
