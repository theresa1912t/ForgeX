import { prisma } from '@/lib/prisma';
import * as alertRepository from '@/lib/repositories/alertRepository';
import * as machineRepository from '@/lib/repositories/machineRepository';
import * as productionLineRepository from '@/lib/repositories/productionLineRepository';
import * as incidentEventRepository from '@/lib/repositories/incidentEventRepository';
import * as investigationRepository from '@/lib/repositories/investigationRepository';
import * as notificationRepository from '@/lib/repositories/notificationRepository';
import { ALERT_TRANSITIONS, INVESTIGATION_TRANSITIONS, assertValidTransition } from '@/lib/domain/statusTransitions';
import { ValidationError, NotFoundError } from '@/lib/usecases/errors';
import type { AlertCategory, AlertSeverity, AlertStatus } from '@/lib/types';

export type SimulationScenario =
  | 'unexpected_shutdown'
  | 'reduced_speed'
  | 'overheating'
  | 'quality_defect'
  | 'recurring_fault';

const SCENARIOS: Record<
  SimulationScenario,
  { category: AlertCategory; severity: AlertSeverity; title: string; description: string }
> = {
  unexpected_shutdown: {
    category: 'Machine',
    severity: 'Critical',
    title: 'unexpected shutdown',
    description: 'Simulated scenario: the machine stopped unexpectedly. Downtime accumulates until recovery.',
  },
  reduced_speed: {
    category: 'Production',
    severity: 'High',
    title: 'operating at reduced speed',
    description: 'Simulated scenario: the machine continues running, but below its expected capacity.',
  },
  overheating: {
    category: 'Machine',
    severity: 'Medium',
    title: 'overheating warning',
    description: 'Simulated scenario: a temperature warning was raised — investigate before any shutdown.',
  },
  quality_defect: {
    category: 'Quality',
    severity: 'High',
    title: 'quality defect detected',
    description: 'Simulated scenario: good output is falling and defective units are rising.',
  },
  recurring_fault: {
    category: 'Machine',
    severity: 'High',
    title: 'recurring fault',
    description: 'Simulated scenario: a previously resolved fault has returned.',
  },
};

// need-checking.md §9 — user-triggered demo scenarios (no continuous background loop). Every
// created/reopened alert is clearly labeled "(simulated)" in its title, per §9's "keep simulation
// clearly labeled as demo data." Manual and simulated incidents share the same Alert model and
// lifecycle as every other alert source — see createAlert.ts / reopenAlert.ts.
export async function simulateFailure(machineId: string, scenario: SimulationScenario) {
  const definition = SCENARIOS[scenario];
  if (!definition) {
    throw new ValidationError(`Unknown simulation scenario: "${scenario}"`);
  }

  const machine = await machineRepository.findById(machineId);
  if (!machine) {
    throw new ValidationError('Machine not found — a machine must exist before an incident can reference it.');
  }

  // Recurring fault: reopen the machine's most recent resolved/dismissed incident when one
  // exists, rather than fabricating an unrelated new one.
  if (scenario === 'recurring_fault') {
    const previous = await alertRepository.findLatestResolvedByMachine(machineId);
    if (previous) {
      return reopenForSimulation({ ...previous, status: previous.status as AlertStatus });
    }
    // No prior resolved incident to recur — fall through and open a fresh one below.
  }

  const existing = await alertRepository.findActiveByMachine(machineId);
  if (existing) {
    throw new ValidationError(
      `${machine.name} already has an open, unresolved incident ("${existing.title}") — resolve or dismiss it before simulating a new one.`,
    );
  }

  const line = await productionLineRepository.findById(machine.lineId);
  if (!line) {
    throw new ValidationError('Production line not found for this machine.');
  }

  return prisma.$transaction(async (tx) => {
    const alert = await alertRepository.create(
      {
        title: `${machine.name} ${definition.title} (simulated)`,
        severity: definition.severity,
        category: definition.category,
        description: definition.description,
        factoryId: line.factoryId,
        lineId: line.id,
        lineName: line.name,
        machineId: machine.id,
        machineName: machine.name,
        detectedAt: 'Just now',
        estimatedImpact: 'Unquantified — simulated scenario, pending investigation.',
        revenueAtRisk: 0,
        confidence: 0,
        status: 'New',
      },
      tx,
    );

    await incidentEventRepository.create(
      {
        alertId: alert.id,
        eventType: 'Simulated',
        toStatus: 'New',
        message: `Simulated "${scenario}" scenario triggered on ${machine.name}.`,
      },
      tx,
    );

    await notificationRepository.create(
      {
        title: 'Simulated Incident Triggered',
        message: `${alert.title} — ${definition.description}`,
        severity: alert.severity,
        category: alert.category,
        linkModule: 'alerts',
      },
      tx,
    );

    return alert;
  });
}

async function reopenForSimulation(alert: {
  id: string;
  title: string;
  status: AlertStatus;
  investigationId?: string;
}) {
  assertValidTransition(ALERT_TRANSITIONS, alert.status, 'Reopened', 'alert status');

  return prisma.$transaction(async (tx) => {
    await alertRepository.updateStatus(alert.id, 'Reopened', {}, tx);

    if (alert.investigationId) {
      const investigation = await investigationRepository.findById(alert.investigationId);
      if (investigation && investigation.status === 'Resolved') {
        assertValidTransition(
          INVESTIGATION_TRANSITIONS,
          investigation.status,
          'Reopened',
          'investigation status',
        );
        await investigationRepository.updateStatus(investigation.id, 'Reopened', tx);
      }
    }

    await incidentEventRepository.create(
      {
        alertId: alert.id,
        eventType: 'Simulated',
        fromStatus: alert.status,
        toStatus: 'Reopened',
        message: `Simulated "recurring_fault" scenario reopened "${alert.title}".`,
      },
      tx,
    );

    const updated = await alertRepository.findById(alert.id, tx);
    if (!updated) {
      throw new NotFoundError('Alert not found after reopening.');
    }

    await notificationRepository.create(
      {
        title: 'Incident Reopened (Simulated Recurrence)',
        message: `"${updated.title}" was reopened — the fault has returned.`,
        severity: updated.severity,
        category: updated.category,
        linkModule: 'alerts',
      },
      tx,
    );

    return updated;
  });
}
