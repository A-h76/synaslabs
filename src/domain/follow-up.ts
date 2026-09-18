import type { TaskPriority } from "./lifecycle";

function addCalendarDays(from: Date, days: number): Date {
  const next = new Date(from.getTime());
  next.setUTCDate(next.getUTCDate() + days);
  return next;
}

function skipWeekend(date: Date): Date {
  const next = new Date(date.getTime());
  const day = next.getUTCDay();
  if (day === 6) next.setUTCDate(next.getUTCDate() + 2);
  if (day === 0) next.setUTCDate(next.getUTCDate() + 1);
  return next;
}

export type FollowUpPlan = {
  title: string;
  dueAt: Date;
  priority: TaskPriority;
  kind: "follow_up";
};

/** Single rule set for Lead Radar and the commercial spine. Do not duplicate. */
export function planFollowUp(
  event:
    | "lead_created"
    | "lead_qualified"
    | "proposal_sent"
    | "proposal_viewed"
    | "signal_captured",
  now = new Date(),
): FollowUpPlan {
  switch (event) {
    case "lead_created":
    case "signal_captured":
      return {
        kind: "follow_up",
        title: "Follow up on new lead",
        dueAt: skipWeekend(addCalendarDays(now, 2)),
        priority: "normal",
      };
    case "lead_qualified":
      return {
        kind: "follow_up",
        title: "Book discovery",
        dueAt: skipWeekend(addCalendarDays(now, 3)),
        priority: "high",
      };
    case "proposal_sent":
      return {
        kind: "follow_up",
        title: "Check whether the proposal was opened",
        dueAt: skipWeekend(addCalendarDays(now, 5)),
        priority: "normal",
      };
    case "proposal_viewed":
      return {
        kind: "follow_up",
        title: "Close or revise the proposal",
        dueAt: skipWeekend(addCalendarDays(now, 7)),
        priority: "high",
      };
  }
}

export function isFollowUpOverdue(
  dueAt: Date | string | null,
  status: string,
  now = new Date(),
): boolean {
  if (!dueAt) return false;
  if (status === "completed" || status === "cancelled") return false;
  const due = typeof dueAt === "string" ? new Date(dueAt) : dueAt;
  return due.getTime() < now.getTime();
}
