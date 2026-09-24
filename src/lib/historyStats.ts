import type { QuizSession } from '@/services/quizApi';

/**
 * Pure date/aggregation helpers for quiz history.
 * History sessions carry { session_id, topic, date, accuracy, total_questions }.
 * All accuracy aggregation is question-weighted (accuracy% × questions).
 */

const DAY_MS = 24 * 60 * 60 * 1000;

export function parseSessionDate(value: string): Date | null {
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

export function dayKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function startOfDay(d: Date): Date {
  const c = new Date(d);
  c.setHours(0, 0, 0, 0);
  return c;
}

/** Sessions whose date falls in [from, to). Invalid dates are skipped. */
export function sessionsInRange(sessions: QuizSession[], from: Date, to: Date): QuizSession[] {
  return sessions.filter((s) => {
    const d = parseSessionDate(s.date);
    return d !== null && d >= from && d < to;
  });
}

/** Question-weighted average accuracy, or null when there are no questions. */
export function weightedAccuracy(sessions: QuizSession[]): number | null {
  let questions = 0;
  let weighted = 0;
  for (const s of sessions) {
    const q = s.total_questions ?? 0;
    if (q <= 0) continue;
    questions += q;
    weighted += (s.accuracy ?? 0) * q;
  }
  return questions > 0 ? weighted / questions : null;
}

export interface WindowComparison {
  recentAccuracy: number | null;
  priorAccuracy: number | null;
  accuracyDelta: number | null;
  recentAnswered: number;
  priorAnswered: number;
  answeredDelta: number | null;
}

/** Compare trailing 7 days (including today) vs the 7 days before. Deltas are null when the prior window is empty. */
export function compareLast7VsPrior7(sessions: QuizSession[], now = new Date()): WindowComparison {
  const end = new Date(startOfDay(now).getTime() + DAY_MS); // start of tomorrow: includes all of today
  const recent = sessionsInRange(sessions, new Date(end.getTime() - 7 * DAY_MS), end);
  const prior = sessionsInRange(
    sessions,
    new Date(end.getTime() - 14 * DAY_MS),
    new Date(end.getTime() - 7 * DAY_MS),
  );
  const recentAccuracy = weightedAccuracy(recent);
  const priorAccuracy = weightedAccuracy(prior);
  const recentAnswered = recent.reduce((s, x) => s + (x.total_questions ?? 0), 0);
  const priorAnswered = prior.reduce((s, x) => s + (x.total_questions ?? 0), 0);
  return {
    recentAccuracy,
    priorAccuracy,
    accuracyDelta:
      recentAccuracy !== null && priorAccuracy !== null ? recentAccuracy - priorAccuracy : null,
    recentAnswered,
    priorAnswered,
    // Null when there is no prior-week baseline to compare against.
    answeredDelta: priorAnswered > 0 ? recentAnswered - priorAnswered : null,
  };
}

export interface DayActivity {
  day: string;
  count: number;
  active: boolean;
  date: Date;
}

/** Questions answered per calendar day for the last 7 days (oldest → newest). */
export function activityByDay(sessions: QuizSession[], now = new Date()): DayActivity[] {
  const today = startOfDay(now);
  const out: DayActivity[] = [];
  for (let i = 6; i >= 0; i--) {
    const date = new Date(today.getTime() - i * DAY_MS);
    const next = new Date(date.getTime() + DAY_MS);
    const count = sessionsInRange(sessions, date, next).reduce(
      (s, x) => s + (x.total_questions ?? 0),
      0,
    );
    out.push({
      day: date.toLocaleDateString(undefined, { weekday: 'short' }),
      count,
      active: count > 0,
      date,
    });
  }
  return out;
}

export interface WeekAccuracy {
  week: string;
  percent: number | null;
}

/** Weighted accuracy per trailing-7-day window (including today), last `weeks` windows (oldest → newest). */
export function weeklyAccuracy(sessions: QuizSession[], now = new Date(), weeks = 5): WeekAccuracy[] {
  const end = new Date(startOfDay(now).getTime() + DAY_MS); // start of tomorrow: includes all of today
  const labels = weeks === 5 ? ['4w ago', '3w ago', '2w ago', 'last wk', 'this wk'] : undefined;
  const out: WeekAccuracy[] = [];
  for (let i = weeks - 1; i >= 0; i--) {
    const from = new Date(end.getTime() - (i + 1) * 7 * DAY_MS);
    const to = new Date(end.getTime() - i * 7 * DAY_MS);
    out.push({
      week: labels ? labels[weeks - 1 - i] : `${i}w ago`,
      percent: weightedAccuracy(sessionsInRange(sessions, from, to)),
    });
  }
  return out;
}

export interface ProgressPoint {
  date: string;
  accuracy: number;
  questions: number;
}

/** Running (cumulative, question-weighted) accuracy after each session, oldest → newest. */
export function cumulativeProgress(sessions: QuizSession[], maxPoints = 12): ProgressPoint[] {
  const dated = sessions
    .map((s) => ({ s, d: parseSessionDate(s.date) }))
    .filter((x): x is { s: QuizSession; d: Date } => x.d !== null)
    .sort((a, b) => a.d.getTime() - b.d.getTime())
    .slice(-maxPoints);
  let questions = 0;
  let weighted = 0;
  return dated.map(({ s, d }) => {
    const q = s.total_questions ?? 0;
    questions += q;
    weighted += (s.accuracy ?? 0) * q;
    return {
      date: d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
      accuracy: questions > 0 ? weighted / questions : 0,
      questions,
    };
  });
}

/**
 * Consecutive calendar days with ≥1 session, anchored at today (or yesterday
 * if today has no session yet). Honest "active days" streak.
 */
export function activeDayStreak(sessions: QuizSession[], now = new Date()): number {
  const days = new Set<string>();
  for (const s of sessions) {
    const d = parseSessionDate(s.date);
    if (d) days.add(dayKey(d));
  }
  if (days.size === 0) return 0;
  let cursor = startOfDay(now);
  if (!days.has(dayKey(cursor))) cursor = new Date(cursor.getTime() - DAY_MS);
  let streak = 0;
  while (days.has(dayKey(cursor))) {
    streak += 1;
    cursor = new Date(cursor.getTime() - DAY_MS);
  }
  return streak;
}

export function firstSessionDate(sessions: QuizSession[]): Date | null {
  let first: Date | null = null;
  for (const s of sessions) {
    const d = parseSessionDate(s.date);
    if (d && (!first || d < first)) first = d;
  }
  return first;
}
