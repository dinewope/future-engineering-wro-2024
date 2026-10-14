import { describe, expect, it } from 'vitest';
import { checkins, visits } from './data';
import {
  burdenRule, dataRule, evaluate, firstFlagDay, formatRanges, fragmentationRule,
  missingInformation, runScenario, timeRule, voiceRule,
} from './rules';
import { isEmergency } from './safety';
import { extractTerms } from './terms';
import type { TimelineEvent } from './types';

const after = [...visits, ...checkins];

describe('time rule', () => {
  it('does not fire before 6 weeks of records', () => {
    expect(timeRule(after, 41).fired).toBe(false);
  });
  it('fires at week 7 (day 42) in the CSUcribe scenario', () => {
    const r = timeRule(after, 42);
    expect(r.fired).toBe(true);
    expect(r.reason).toBe('Hives/swelling recorded on 12 dates over 6 weeks.');
    expect(r.evidence.length).toBeGreaterThan(0);
  });
  it('needs at least two dates', () => {
    expect(timeRule([visits[0]]).fired).toBe(false);
  });
});

describe('fragmentation rule', () => {
  it('fires when the same complaint shows up in two settings within 12 months', () => {
    expect(fragmentationRule(visits, 90).fired).toBe(false);
    const r = fragmentationRule(visits, 91);
    expect(r.fired).toBe(true);
    expect(r.evidence.map((e) => e.id)).toEqual(['v1', 'v2']);
  });
  it('ignores patient check-ins', () => {
    expect(fragmentationRule(checkins).fired).toBe(false);
  });
});

describe('burden rule', () => {
  it('fires on 3 sleep-disrupted check-ins within 7 days', () => {
    expect(burdenRule(checkins, 44).fired).toBe(false);
    expect(burdenRule(checkins, 45).reason).toContain('Sleep disrupted on 3 check-ins within 7 days.');
  });
  it('fires on UCT below 12 twice in a row (7 and 9)', () => {
    expect(burdenRule(checkins, 56).reason).toContain('(7 and 9)');
  });
  it('does not fire when control is good', () => {
    const ok: TimelineEvent[] = [
      { id: 'a', day: 1, setting: 'checkin', channel: 'app', source: 's', text: '', uct: 13 },
      { id: 'b', day: 30, setting: 'checkin', channel: 'app', source: 's', text: '', uct: 9 },
    ];
    expect(burdenRule(ok).fired).toBe(false);
  });
});

describe('voice rule', () => {
  it('fires only when the patient asks for a review', () => {
    expect(voiceRule(after).fired).toBe(false);
    const ask: TimelineEvent = { id: 'r', day: 71, setting: 'checkin', channel: 'app', source: 's', text: '', reviewRequested: true };
    expect(voiceRule([...after, ask]).fired).toBe(true);
  });
});

describe('data rule', () => {
  it('flags the conflicting app vs text-message entries on day 49', () => {
    expect(dataRule(after, 48).fired).toBe(false);
    const r = dataRule(after, 49);
    expect(r.fired).toBe(true);
    expect(r.reason).toContain('Records disagree on day 49');
    expect(r.evidence.map((e) => e.id).sort()).toEqual(['c13', 'c14']);
  });
});

describe('evaluate / scenario', () => {
  it('first flag is at week 7, with limited evidence', () => {
    expect(firstFlagDay(after)).toBe(42);
    const r = evaluate(after, 42);
    expect(r.fired.map((f) => f.id)).toEqual(['time']);
    expect(r.strength).toBe('Limited');
  });
  it('evidence becomes strong once 3 rules fire', () => {
    expect(evaluate(after, 49).strength).toBe('Strong');
  });
  it('before = today\'s care: no engine, no flag', () => {
    expect(runScenario('before', visits)).toBeNull();
    expect(runScenario('after', after)?.reviewSuggested).toBe(true);
  });
  it('never outputs diagnosis wording, scores or probabilities', () => {
    const text = evaluate(after).results.map((r) => r.reason).join(' ');
    expect(text).not.toMatch(/diagnos|probab|risk score|%/i);
  });
});

describe('missing information', () => {
  it('lists gaps for the visit-only record', () => {
    const m = missingInformation(visits);
    expect(m).toContain('No Urticaria Control Test on record.');
    expect(m.some((s) => s.startsWith('Sleep impact not recorded at visits 1–4, 6'))).toBe(true);
    expect(m.some((s) => s.startsWith('No symptom record between visits'))).toBe(true);
  });
  it('notes photos only came from check-ins', () => {
    expect(missingInformation(after)).toContain('Photos only from patient check-ins; none taken at visits.');
  });
  it('formats ranges', () => expect(formatRanges([1, 2, 3, 5])).toBe('1–3, 5'));
});

describe('safety stop (not part of the rule engine)', () => {
  it('stops on throat/tongue swelling', () => {
    expect(isEmergency({ swellingSites: ['lips', 'throat'], troubleBreathing: false })).toBe(true);
  });
  it('stops on trouble breathing or swallowing', () => {
    expect(isEmergency({ swellingSites: [], troubleBreathing: true })).toBe(true);
  });
  it('does not stop for lips or eyelids alone', () => {
    expect(isEmergency({ swellingSites: ['lips', 'eyelids'], troubleBreathing: false })).toBe(false);
  });
});

describe('patient words -> terms', () => {
  it('maps different words for the same symptom', () => {
    const terms = extractTerms(after);
    const find = (p: string) => terms.find((t) => t.phrase === p)?.term;
    expect(find('itchy bumps')).toBe('Wheals');
    expect(find('welts')).toBe('Wheals');
    expect(find('ronchas')).toBe('Wheals');
    expect(find('lips puffed up')).toBe('Swelling (lips)');
  });
});
