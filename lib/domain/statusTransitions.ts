import { ValidationError } from '@/lib/usecases/errors';
import type { AlertStatus, ActionTaskStatus } from '@/lib/types';

type InvestigationStatus = 'Active' | 'Investigating' | 'Resolved' | 'Reopened';

// Server-side transition whitelists (need-checking.md §5/§11: "Do not allow arbitrary status
// changes merely because a client sends a new status value"). Each key lists the statuses it may
// legally move to next; anything else is rejected regardless of what a client requests.
// "Investigate with AI" is offered in the UI for any alert with no investigation yet, regardless
// of its current status (AlertsModule.tsx only checks `!alert.investigationId`) — so every status
// lists 'Investigating' as reachable, matching generateInvestigation.ts's own real guard
// (investigationId is null + a machineId exists), not an invented stricter rule.
export const ALERT_TRANSITIONS: Record<AlertStatus, AlertStatus[]> = {
  New: ['Investigating', 'Action Required', 'Dismissed'],
  Investigating: ['Action Required', 'In Progress', 'Resolved', 'Dismissed'],
  'Action Required': ['Investigating', 'In Progress', 'Resolved', 'Dismissed'],
  'In Progress': ['Investigating', 'Resolved', 'Dismissed'],
  Resolved: ['Investigating', 'Reopened'],
  Dismissed: ['Investigating', 'Reopened'],
  Reopened: ['Investigating', 'Action Required', 'In Progress', 'Resolved', 'Dismissed'],
};

export const INVESTIGATION_TRANSITIONS: Record<InvestigationStatus, InvestigationStatus[]> = {
  Active: ['Investigating', 'Resolved'],
  Investigating: ['Resolved'],
  Resolved: ['Reopened'],
  Reopened: ['Investigating', 'Resolved'],
};

// ActionsModule.tsx's "Complete & Log Outcome" button is shown — and works — on a task in ANY
// open status (Pending, Assigned, or In Progress), not only after "Mark In Progress"; a
// technician can and does complete a task straight from Pending. The map reflects that real UI
// behavior, not an idealized stricter workflow.
export const ACTION_TASK_TRANSITIONS: Record<ActionTaskStatus, ActionTaskStatus[]> = {
  Pending: ['Assigned', 'In Progress', 'Completed', 'Cancelled'],
  Assigned: ['In Progress', 'Completed', 'Cancelled'],
  'In Progress': ['Completed', 'Cancelled'],
  Completed: [],
  Cancelled: [],
};

export function assertValidTransition<T extends string>(
  transitions: Record<T, T[]>,
  from: T,
  to: T,
  label: string,
): void {
  if (from === to) {
    return;
  }
  const allowed = transitions[from] ?? [];
  if (!allowed.includes(to)) {
    throw new ValidationError(
      `Invalid ${label} transition: "${from}" cannot move to "${to}". Allowed: ${allowed.length > 0 ? allowed.join(', ') : '(none — terminal status)'}.`,
    );
  }
}
