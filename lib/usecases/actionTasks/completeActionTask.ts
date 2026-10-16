import { prisma } from '@/lib/prisma';
import * as actionTaskRepository from '@/lib/repositories/actionTaskRepository';
import * as investigationRepository from '@/lib/repositories/investigationRepository';
import * as alertRepository from '@/lib/repositories/alertRepository';
import * as productionLineRepository from '@/lib/repositories/productionLineRepository';
import * as machineRepository from '@/lib/repositories/machineRepository';
import * as maintenanceRecordRepository from '@/lib/repositories/maintenanceRecordRepository';
import * as notificationRepository from '@/lib/repositories/notificationRepository';
import { NotFoundError } from '@/lib/usecases/errors';

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
    } else {
      if (task.alertId) {
        await alertRepository.updateStatus(task.alertId, 'Resolved', {}, tx);
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
