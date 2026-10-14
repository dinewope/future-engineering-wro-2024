/**
 * Emergency safety stop. Hard-coded, not AI, and kept outside the rule engine on purpose.
 * Throat/tongue swelling or trouble breathing/swallowing always shows the 911 banner,
 * and that entry is never sent to the timeline or the rules.
 */
export interface SafetyInput {
  swellingSites: string[];
  troubleBreathing: boolean | null;
}

export const EMERGENCY_SITES = ['throat'] as const;

export function isEmergency(input: SafetyInput): boolean {
  return input.troubleBreathing === true || input.swellingSites.some((s) => (EMERGENCY_SITES as readonly string[]).includes(s));
}
