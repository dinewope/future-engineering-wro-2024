export type Setting = 'urgent' | 'primary' | 'derm' | 'checkin';
export type Channel = 'visit' | 'app' | 'sms' | 'phone' | 'paper';
export type Level = 0 | 1 | 2 | 3;

/** One point on Elena's timeline. Every event carries the source text it came from. */
export interface TimelineEvent {
  id: string;
  /** Days since the first documented symptom (day 0 = month 0). */
  day: number;
  setting: Setting;
  channel: Channel;
  /** Where the text came from, e.g. "Urgent care visit note". */
  source: string;
  /** The original note or the patient's own words. */
  text: string;
  /** Visit notes: hives reported or seen (true), or explicitly absent (false). */
  hives?: boolean;
  /** Patient check-ins: daily wheal level, 0–3. */
  wheals?: Level;
  /** Patient check-ins: daily itch level, 0–3. */
  itch?: Level;
  swelling?: string[];
  swellingDurationHours?: number;
  sleepDisrupted?: boolean;
  missedPlans?: boolean;
  photo?: boolean;
  /** In-memory preview URL for a photo added during the live demo. Never uploaded. */
  photoUrl?: string;
  /** Urticaria Control Test, 0–16. */
  uct?: number;
  /** Visit notes: the presenting complaint, normalised. */
  complaint?: string;
  reviewRequested?: boolean;
  /** Added during the live demo. */
  live?: boolean;
}

export type RuleId = 'time' | 'fragmentation' | 'burden' | 'voice' | 'data';

export interface RuleResult {
  id: RuleId;
  name: string;
  fired: boolean;
  reason: string;
  evidence: TimelineEvent[];
}
