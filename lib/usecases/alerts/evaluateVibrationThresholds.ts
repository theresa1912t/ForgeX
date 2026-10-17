import * as sensorReadingRepository from '@/lib/repositories/sensorReadingRepository';
import * as alertRepository from '@/lib/repositories/alertRepository';
import * as notificationRepository from '@/lib/repositories/notificationRepository';
import * as machineRepository from '@/lib/repositories/machineRepository';
import * as productionLineRepository from '@/lib/repositories/productionLineRepository';
import * as thresholdsRepository from '@/lib/repositories/thresholdsRepository';
import * as incidentEventRepository from '@/lib/repositories/incidentEventRepository';

const VIBRATION_METRIC_KEY = 'vibrationMmS';

// On-demand threshold check (triggered via POST /api/v1/alerts/evaluate-thresholds, not a
// background poller — see PLANNING.md Phase 5 discussion for why). Only vibration is evaluated:
// it's the only metric with a real live feed (Phase 4's MQTT pipeline). Dedupes against ANY
// unresolved alert on the machine, not just ones this function created, so it never piles a
// redundant alert on top of an already-open issue (e.g. the seeded hero incident).
export async function evaluateVibrationThresholds() {
  const thresholds = await thresholdsRepository.find();
  if (!thresholds) {
    return { createdFor: [] as string[] };
  }

  const machineIds = await sensorReadingRepository.findDistinctMachineIds(VIBRATION_METRIC_KEY);
  const createdFor: string[] = [];

  for (const machineId of machineIds) {
    const latest = await sensorReadingRepository.findLatest(machineId, VIBRATION_METRIC_KEY);
    if (!latest || latest.value <= thresholds.vibrationAnomalyMmS) {
      continue;
    }

    const existing = await alertRepository.findActiveByMachine(machineId);
    if (existing) {
      continue;
    }

    const machine = await machineRepository.findById(machineId);
    if (!machine) {
      continue;
    }
    const line = await productionLineRepository.findById(machine.lineId);
    if (!line) {
      continue;
    }

    const alert = await alertRepository.create({
      title: `${machine.name} vibration exceeds threshold (${latest.value.toFixed(2)} mm/s > ${thresholds.vibrationAnomalyMmS} mm/s)`,
      severity: 'High',
      category: 'Machine',
      description:
        'Live MQTT telemetry reports sustained vibration above the configured anomaly threshold.',
      factoryId: line.factoryId,
      lineId: line.id,
      lineName: line.name,
      machineId: machine.id,
      machineName: machine.name,
      detectedAt: 'Just now',
      estimatedImpact: 'Unquantified — detected via live telemetry, pending investigation.',
      revenueAtRisk: 0,
      confidence: 75,
      status: 'New',
    });

    await incidentEventRepository.create({
      alertId: alert.id,
      eventType: 'Created',
      toStatus: 'New',
      message: `Alert auto-created from live telemetry: vibration ${latest.value.toFixed(2)} mm/s exceeded the ${thresholds.vibrationAnomalyMmS} mm/s threshold.`,
    });

    await notificationRepository.create({
      title: 'New Machine Alert from Live Telemetry',
      message: `${machine.name} vibration (${latest.value.toFixed(2)} mm/s) exceeded the ${thresholds.vibrationAnomalyMmS} mm/s threshold.`,
      severity: 'High',
      category: 'Machine',
      linkModule: 'alerts',
    });

    createdFor.push(machine.name);
  }

  return { createdFor };
}
