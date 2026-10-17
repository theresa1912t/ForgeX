import { prisma } from '@/lib/prisma';
import * as actionTaskRepository from '@/lib/repositories/actionTaskRepository';
import * as investigationRepository from '@/lib/repositories/investigationRepository';
import * as alertRepository from '@/lib/repositories/alertRepository';
import * as productionLineRepository from '@/lib/repositories/productionLineRepository';
import * as machineRepository from '@/lib/repositories/machineRepository';
import * as maintenanceRecordRepository from '@/lib/repositories/maintenanceRecordRepository';
import * as notificationRepository from '@/lib/repositories/notificationRepository';
import * as incidentEventRepository from '@/lib/repositories/incidentEventRepository';
import { NotFoundError } from '@/lib/usecases/errors';
import { ACTION_TASK_TRANSITIONS, assertValidTransition } from '@/lib/domain/statusTransitions';
import type { ActionTaskStatus } from '@/lib/types';

const HERO_INVESTIGATION_ID = 'inv-line3-hero';
const HERO_ALERT_ID = 'alt-line3-loss';
const HERO_LINE_ID = 'line-3';
const HERO_MACHINE_ID = 'mach-m03';

export async function completeActionTask(
  id: string,
  input: {
    actualResult: string;
    resolutionNotes: string;
    recoveredUnitsPerHour?: number;
    completedBy?: string;
  },
) {
  const recoveredUnitsPerHour = input.recoveredUnitsPerHour ?? 920;
  const completedBy = input.completedBy ?? 'Operations Manager';

  const task = await actionTaskRepository.findById(id);
  if (!task) {
    throw new NotFoundError('Action task not found');
  }
  // serialize()'s return type doesn't reflect the status enum->display-string remap it actually
  // does at runtime (a pre-existing repository-layer typing gap) — the cast corrects the static
  // type to match the real runtime value, it doesn't change behavior.
  assertValidTransition(ACTION_TASK_TRANSITIONS, task.status as ActionTaskStatus, 'Completed', 'action task status');

  // Not transition-validated: an Alert's status isn't reliably coupled to its task/investigation
  // progress (seed data can have an alert still at "New" with a fully-formed investigation and
  // task already attached), and nothing client-facing lets a caller choose this target status —
  // it's always "Resolved" here, decided by this code, not by request input.
  const alert = task.alertId ? await alertRepository.findById(task.alertId) : null;

  return prisma.$transaction(async (tx) => {
    const completedTask = await actionTaskRepository.complete(
      id,
      { actualResult: input.actualResult, resolutionNotes: input.resolutionNotes },
      tx,
    );

    // Mirrors factoryStore.tsx's hardcoded "golden path" demo scenario: completing the task
    // tied to the Line 3 hero investigation cascades a specific, scripted set of improvements.
    const isHeroTask =
      task.investigationId === HERO_INVESTIGATION_ID || task.alertId === HERO_ALERT_ID;

    if (isHeroTask) {
      await investigationRepository.updateResolution(
        HERO_INVESTIGATION_ID,
        {
          status: 'Resolved',
          resolvedAt: 'Today at 12:45 PM',
          resolutionOutcome: {
            recoveredUnitsPerHour,
            notes:
              input.resolutionNotes ||
              'Filling valve M-03-V2 inspected and diaphragm seal kit replaced. Vibration normalized.',
            completedBy,
            date: 'Today',
          },
        },
        tx,
      );

      await alertRepository.updateStatus(
        HERO_ALERT_ID,
        'Resolved',
        { resolvedAt: 'Today at 12:45 PM' },
        tx,
      );

      await productionLineRepository.update(
        HERO_LINE_ID,
        {
          status: 'Running',
          currentUnitsPerHour: 5380,
          efficiencyPct: 99.6,
          defectRatePct: 0.45,
          productionLossUnits: 140,
          activeAlertCount: 0,
        },
        tx,
      );

      await machineRepository.update(
        HERO_MACHINE_ID,
        {
          status: 'Normal',
          healthScorePct: 96,
          vibrationMmS: 1.85,
          cycleTimeSec: 0.67,
          activeAlertCount: 0,
          productionLossContributionPct: 3,
        },
        tx,
      );

      await maintenanceRecordRepository.create(
        {
          machineId: HERO_MACHINE_ID,
          machineName: 'Aseptic Rotary Liquid Filler M-03',
          date: '2026-10-08',
          type: 'Corrective',
          issue: 'Replaced degraded aseptic filling valve M-03-V2 diaphragm seal',
          failureType: 'Aseptic Valve Diaphragm Replacement',
          repairDurationMinutes: 28,
          technician: task.assignedTo || 'Carlos Ruiz',
          notes:
            input.resolutionNotes ||
            'Installed OEM EPDM aseptic diaphragm kit #LP-DIA-04. Recalibrated stroke pressure to 3.2 bar.',
          status: 'Completed',
        },
        tx,
      );

      await notificationRepository.create(
        {
          title: 'Action Task COMPLETED - Line 3 Restored',
          message: `Filling valve M-03-V2 serviced. Line 3 recovered ${recoveredUnitsPerHour} units/hr. Alert resolved.`,
          severity: 'Low',
          category: 'Production',
          linkModule: 'dashboard',
        },
        tx,
      );

      await incidentEventRepository.create(
        {
          alertId: HERO_ALERT_ID,
          eventType: 'TaskCompleted',
          actorName: completedBy,
          fromStatus: alert?.status ?? null,
          toStatus: 'Resolved',
          message: `Task "${task.title}" completed by ${completedBy}. Line recovered +${recoveredUnitsPerHour} units/hr.`,
        },
        tx,
      );
    } else {
      // Unlike the hero branch's scripted cascade, this only resolves what's actually linked to
      // this task — and only once every task sharing its investigation is itself
      // Completed/Cancelled. An investigation with 2 tasks doesn't resolve just because 1 of them
      // is done; it waits for the last one (this task's own row is already Completed, above, so
      // it counts itself). Grouped by investigationId, not alertId — a legacy task with no
      // investigationId but the same alertId (old seed data) must not block an unrelated
      // investigation's resolution just because it happens to share the alert.
      const siblingTasks = task.investigationId
        ? await actionTaskRepository.findByInvestigation(task.investigationId, tx)
        : task.alertId
        ? await actionTaskRepository.findByAlert(task.alertId, tx)
        : [];
      const allTasksDone =
        siblingTasks.length > 0 &&
        siblingTasks.every((t) => t.status === 'Completed' || t.status === 'Cancelled');

      if (allTasksDone) {
        if (task.investigationId) {
          await investigationRepository.updateResolution(
            task.investigationId,
            {
              status: 'Resolved',
              resolvedAt: 'Today',
              resolutionOutcome: {
                recoveredUnitsPerHour,
                notes: input.resolutionNotes || input.actualResult,
                completedBy,
                date: 'Today',
              },
            },
            tx,
          );
        }

        if (task.alertId) {
          await alertRepository.updateStatus(task.alertId, 'Resolved', {}, tx);

          await incidentEventRepository.create(
            {
              alertId: task.alertId,
              eventType: 'TaskCompleted',
              actorName: completedBy,
              fromStatus: alert?.status ?? null,
              toStatus: 'Resolved',
              message: `Task "${task.title}" completed by ${completedBy}. All linked tasks are now complete — incident resolved.`,
            },
            tx,
          );
        }
      } else if (task.alertId) {
        const remaining = siblingTasks.filter((t) => t.status !== 'Completed' && t.status !== 'Cancelled').length;
        await incidentEventRepository.create(
          {
            alertId: task.alertId,
            eventType: 'TaskCompleted',
            actorName: completedBy,
            message: `Task "${task.title}" completed by ${completedBy}. ${remaining} other task${remaining > 1 ? 's' : ''} still open — incident not yet resolved.`,
          },
          tx,
        );
      }

      await notificationRepository.create(
        {
          title: 'Operational Task Completed',
          message: `Task "${task.title}" was marked completed by ${completedBy}.`,
          severity: 'Low',
          category: 'Production',
          linkModule: 'actions',
        },
        tx,
      );
    }

    return completedTask;
  });
}
