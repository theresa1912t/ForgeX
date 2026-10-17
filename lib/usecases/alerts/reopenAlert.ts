import { prisma } from '@/lib/prisma';
import * as alertRepository from '@/lib/repositories/alertRepository';
import * as investigationRepository from '@/lib/repositories/investigationRepository';
import * as incidentEventRepository from '@/lib/repositories/incidentEventRepository';
import * as notificationRepository from '@/lib/repositories/notificationRepository';
import { ALERT_TRANSITIONS, INVESTIGATION_TRANSITIONS, assertValidTransition } from '@/lib/domain/statusTransitions';
import { NotFoundError } from '@/lib/usecases/errors';
import type { AlertStatus, Investigation } from '@/lib/types';

// need-checking.md §4/§5: "A resolved incident can be reopened if the fault returns." Only
// Resolved/Dismissed alerts are eligible (enforced by ALERT_TRANSITIONS) — this is the one path
// that moves an alert back out of a terminal state.
export async function reopenAlert(
  alertId: string,
  input: { reason: string; actorName?: string | null },
) {
  const alert = await alertRepository.findById(alertId);
  if (!alert) {
    throw new NotFoundError('Alert not found');
  }

  assertValidTransition(ALERT_TRANSITIONS, alert.status as AlertStatus, 'Reopened', 'alert status');

  return prisma.$transaction(async (tx) => {
    await alertRepository.updateStatus(alertId, 'Reopened', {}, tx);

    if (alert.investigationId) {
      const investigation = await investigationRepository.findById(alert.investigationId);
      // Only a Resolved investigation needs reopening — one already sitting at
      // Active/Investigating (seed data can have this if it was never formally resolved) is
      // already "open" and shouldn't be rejected as an invalid transition.
      if (investigation && investigation.status === 'Resolved') {
        assertValidTransition(
          INVESTIGATION_TRANSITIONS,
          investigation.status as Investigation['status'],
          'Reopened',
          'investigation status',
        );
        await investigationRepository.updateStatus(investigation.id, 'Reopened', tx);
      }
    }

    await incidentEventRepository.create(
      {
        alertId,
        eventType: 'Reopened',
        actorName: input.actorName ?? null,
        fromStatus: alert.status,
        toStatus: 'Reopened',
        message: input.reason?.trim()
          ? `Reopened: ${input.reason.trim()}`
          : 'Reopened — the issue has returned.',
      },
      tx,
    );

    const updated = await alertRepository.findById(alertId, tx);
    if (!updated) {
      throw new Error('Alert was reopened but could not be re-fetched.');
    }

    await notificationRepository.create(
      {
        title: 'Incident Reopened',
        message: `"${updated.title}" was reopened${input.reason?.trim() ? `: ${input.reason.trim()}` : ' — the issue has returned.'}`,
        severity: updated.severity,
        category: updated.category,
        linkModule: 'alerts',
      },
      tx,
    );

    return updated;
  });
}
