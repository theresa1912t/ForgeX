import { prisma } from '@/lib/prisma';
import * as alertRepository from '@/lib/repositories/alertRepository';
import * as machineRepository from '@/lib/repositories/machineRepository';
import * as productionLineRepository from '@/lib/repositories/productionLineRepository';
import * as incidentEventRepository from '@/lib/repositories/incidentEventRepository';
import * as notificationRepository from '@/lib/repositories/notificationRepository';
import type { AlertCategory, AlertSeverity } from '@/lib/types';
import { ValidationError } from '@/lib/usecases/errors';

// Manual incident registration (need-checking.md Journey A) — the one path in the app where an
// operator, not AI or a threshold rule, opens an incident. Shares the same Alert row and lifecycle
// as every other alert source; only how it's created differs.
export async function createAlert(input: {
  machineId: string;
  category: AlertCategory;
  severity: AlertSeverity;
  title: string;
  description: string;
  reportedBy?: string | null;
}) {
  if (!input.machineId || !input.title?.trim() || !input.description?.trim()) {
    throw new ValidationError('machineId, title, and description are required.');
  }

  const machine = await machineRepository.findById(input.machineId);
  if (!machine) {
    throw new ValidationError('Machine not found — a machine must exist before an incident can reference it.');
  }
  const line = await productionLineRepository.findById(machine.lineId);
  if (!line) {
    throw new ValidationError('Production line not found for this machine.');
  }

  return prisma.$transaction(async (tx) => {
    const alert = await alertRepository.create(
      {
        title: input.title.trim(),
        severity: input.severity,
        category: input.category,
        description: input.description.trim(),
        factoryId: line.factoryId,
        lineId: line.id,
        lineName: line.name,
        machineId: machine.id,
        machineName: machine.name,
        detectedAt: 'Just now',
        estimatedImpact: 'Unquantified — manually reported, pending investigation.',
        revenueAtRisk: 0,
        // Not AI-assessed — this is a human-filed report, so it carries no confidence score.
        confidence: 0,
        status: 'New',
      },
      tx,
    );

    await incidentEventRepository.create(
      {
        alertId: alert.id,
        eventType: 'Created',
        actorName: input.reportedBy ?? null,
        fromStatus: null,
        toStatus: 'New',
        message: `Issue manually reported${input.reportedBy ? ` by ${input.reportedBy}` : ''}: "${alert.title}"`,
      },
      tx,
    );

    await notificationRepository.create(
      {
        title: 'New Issue Reported',
        message: `${machine.name}: "${alert.title}"${input.reportedBy ? ` — reported by ${input.reportedBy}` : ''}.`,
        severity: alert.severity,
        category: alert.category,
        linkModule: 'alerts',
      },
      tx,
    );

    return alert;
  });
}
