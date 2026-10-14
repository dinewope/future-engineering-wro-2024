import raw from './elena.json';
import type { TimelineEvent } from '../types';

export const patient = raw.patient;
export const visits = raw.visits as TimelineEvent[];
export const checkins = raw.checkins as TimelineEvent[];

/** Last day of the demo record (the month-24 referral visit). */
export const LAST_VISIT_DAY = Math.max(...visits.map((v) => v.day));
