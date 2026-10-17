import { randomUUID } from 'crypto';
import { prisma } from '@/lib/prisma';
import * as alertRepository from '@/lib/repositories/alertRepository';
import * as machineRepository from '@/lib/repositories/machineRepository';
import * as productionLineRepository from '@/lib/repositories/productionLineRepository';
import * as productRepository from '@/lib/repositories/productRepository';
import * as sensorReadingRepository from '@/lib/repositories/sensorReadingRepository';
import * as thresholdsRepository from '@/lib/repositories/thresholdsRepository';
import * as materialBatchRepository from '@/lib/repositories/materialBatchRepository';
import * as wasteRecordRepository from '@/lib/repositories/wasteRecordRepository';
import * as downtimeRecordRepository from '@/lib/repositories/downtimeRecordRepository';
import * as investigationRepository from '@/lib/repositories/investigationRepository';
import * as recommendedActionRepository from '@/lib/repositories/recommendedActionRepository';
import * as incidentEventRepository from '@/lib/repositories/incidentEventRepository';
import { rootCauseStatusMap, recommendationStatusMap } from '@/prisma/enumMaps';
import { generateSummary } from '@/lib/server/gemini';
import { NotFoundError, ValidationError } from '@/lib/usecases/errors';

const INSUFFICIENT_DATA_MESSAGE =
  'Not enough data linked to this alert to generate an investigation yet.';

type SignalKind = 'Machine' | 'Material' | 'Waste' | 'Downtime';

interface Signal {
  kind: SignalKind;
  title: string;
  detail: string;
  metric: string;
  delta: string;
  source: string;
  confidence: number;
}

export async function generateInvestigation(alertId: string) {
  const alert = await alertRepository.findById(alertId);
  if (!alert) {
    throw new NotFoundError('Alert not found');
  }
  if (alert.investigationId) {
    throw new ValidationError('This alert already has an investigation.');
  }
  if (!alert.machineId) {
    throw new ValidationError(INSUFFICIENT_DATA_MESSAGE);
  }

  const machine = await machineRepository.findById(alert.machineId);
  if (!machine) {
    throw new ValidationError(INSUFFICIENT_DATA_MESSAGE);
  }
  const line = await productionLineRepository.findById(machine.lineId);
  if (!line) {
    throw new ValidationError(INSUFFICIENT_DATA_MESSAGE);
  }

  let product = alert.productId ? await productRepository.findById(alert.productId) : null;
  if (!product) {
    product = await productRepository.findByName(line.currentProduct);
  }
  if (!product) {
    throw new ValidationError(INSUFFICIENT_DATA_MESSAGE);
  }
  const productId = product.id;
  const productName = product.name;

  // --- Gather real evidence (only what actually exists — never fabricated) ---
  const signals: Signal[] = [];

  const thresholds = await thresholdsRepository.find();
  const latestVibration = await sensorReadingRepository.findLatest(machine.id, 'vibrationMmS');
  if (thresholds && latestVibration && latestVibration.value > thresholds.vibrationAnomalyMmS) {
    const deviationPct =
      ((latestVibration.value - thresholds.vibrationAnomalyMmS) / thresholds.vibrationAnomalyMmS) *
      100;
    signals.push({
      kind: 'Machine',
      title: `Elevated vibration on ${machine.name}`,
      detail: `Live telemetry reads ${latestVibration.value.toFixed(2)} mm/s, ${deviationPct.toFixed(0)}% above the configured ${thresholds.vibrationAnomalyMmS} mm/s anomaly threshold.`,
      metric: 'vibrationMmS',
      delta: `+${deviationPct.toFixed(0)}%`,
      source: 'Live MQTT telemetry',
      confidence: Math.min(95, 60 + deviationPct / 2),
    });
  }

  const relatedBatches = await materialBatchRepository.findByRelatedAlert(alertId);
  const worstBatch = relatedBatches
    .filter((b) => b.viscosityDeviationPct != null)
    .sort((a, b) => Math.abs(b.viscosityDeviationPct!) - Math.abs(a.viscosityDeviationPct!))[0];
  if (worstBatch) {
    const deviationPct = Math.abs(worstBatch.viscosityDeviationPct!);
    signals.push({
      kind: 'Material',
      title: `Raw material quality variance (batch ${worstBatch.batchCode})`,
      detail: `Batch ${worstBatch.batchCode} shows a ${worstBatch.viscosityDeviationPct}% viscosity deviation from spec.`,
      metric: 'viscosityDeviationPct',
      delta: `${worstBatch.viscosityDeviationPct}%`,
      source: 'Material batch record',
      confidence: Math.min(90, 50 + deviationPct * 3),
    });
  }

  const wasteRecords = await wasteRecordRepository.findByMachine(machine.id);
  const worstWaste = wasteRecords.sort((a, b) => b.wasteCost - a.wasteCost)[0];
  if (worstWaste) {
    signals.push({
      kind: 'Waste',
      title: `Elevated scrap/waste at ${machine.name}`,
      detail: `Waste record logged ${worstWaste.wasteQuantityKg}kg ($${worstWaste.wasteCost.toFixed(2)}) attributed to ${worstWaste.wasteReason}.`,
      metric: 'wasteCost',
      delta: `$${worstWaste.wasteCost.toFixed(2)}`,
      source: 'Waste/scrap record',
      confidence: 60,
    });
  }

  const downtimeRecords = await downtimeRecordRepository.findByMachine(machine.id);
  const worstDowntime = downtimeRecords.sort(
    (a, b) => b.estimatedImpactCost - a.estimatedImpactCost,
  )[0];
  if (worstDowntime) {
    signals.push({
      kind: 'Downtime',
      title: `Unplanned downtime on ${machine.name}`,
      detail: `${worstDowntime.durationMinutes} minute stoppage logged ($${worstDowntime.estimatedImpactCost.toFixed(2)}) — ${worstDowntime.category}: ${worstDowntime.reason}.`,
      metric: 'downtimeCost',
      delta: `$${worstDowntime.estimatedImpactCost.toFixed(2)}`,
      source: 'Downtime record',
      confidence: 65,
    });
  }

  if (signals.length === 0) {
    throw new ValidationError(INSUFFICIENT_DATA_MESSAGE);
  }

  signals.sort((a, b) => b.confidence - a.confidence);

  const ownerByKind: Record<SignalKind, 'Maintenance' | 'Quality' | 'Operations'> = {
    Machine: 'Maintenance',
    Material: 'Quality',
    Waste: 'Operations',
    Downtime: 'Maintenance',
  };

  const investigationId = `inv-user-${randomUUID()}`;

  const rootCauses = signals.map((signal, index) => ({
    id: `rc-user-${randomUUID()}`,
    investigationId,
    rank: index + 1,
    title: signal.title,
    confidence: Math.round(signal.confidence),
    status: rootCauseStatusMap[
      index === 0 ? 'Likely Contributor' : signal.confidence >= 60 ? 'Secondary Factor' : 'Under Review'
    ],
    summary: signal.detail,
    supportingEvidence: [signal.detail],
    historicalPrecedent: `Flagged via ${signal.source.toLowerCase()}, not yet cross-referenced against historical failure records.`,
  }));

  const evidence = signals.map((signal) => ({
    id: `ev-user-${randomUUID()}`,
    investigationId,
    signalType: 'FACT' as const,
    title: signal.title,
    detail: signal.detail,
    metric: signal.metric,
    delta: signal.delta,
    source: signal.source,
    verified: true,
  }));

  const recommendations = signals.map((signal) => ({
    id: `rec-user-${randomUUID()}`,
    investigationId,
    title: `Address: ${signal.title}`,
    reason: signal.detail,
    priority: signal.confidence >= 80 ? ('Critical' as const) : signal.confidence >= 65 ? ('High' as const) : ('Medium' as const),
    owner: ownerByKind[signal.kind],
    estimatedEffort: 'Unestimated — pending technician review',
    expectedImpact: 'Not yet quantified',
    evidence: signal.detail,
    status: recommendationStatusMap['Pending'],
  }));

  // Real rate, not a cumulative total — we have no reliable "how long has this been happening"
  // duration to multiply by, so lostUnits/estimatedRevenueLoss stay honest at 0/alert.revenueAtRisk
  // rather than guessing a cumulative figure. The rate itself IS real: line's actual target vs.
  // current throughput, times the product's actual unit revenue.
  const lostUnitsPerHour = Math.max(0, line.targetUnitsPerHour - line.currentUnitsPerHour);
  const currentLossRatePerHour = lostUnitsPerHour * product.unitRevenue;

  const businessImpact = {
    investigationId,
    lostUnits: 0,
    estimatedRevenueLoss: alert.revenueAtRisk ?? 0,
    additionalReworkUnits: 0,
    additionalReworkCost: 0,
    materialWasteKg: worstWaste?.wasteQuantityKg ?? 0,
    materialWasteCost: worstWaste?.wasteCost ?? 0,
    downtimeMinutes: worstDowntime?.durationMinutes ?? 0,
    downtimeCost: worstDowntime?.estimatedImpactCost ?? 0,
    currentLossRatePerHour,
    potentialAdditionalLoss4h: currentLossRatePerHour * 4,
  };

  const top = signals[0];
  const fallbackSummary = `Investigation generated from ${signals.length} real evidence signal${signals.length > 1 ? 's' : ''}. Highest-confidence factor: ${top.title} (${Math.round(top.confidence)}% confidence).`;
  const geminiSummary = await generateSummary(
    `Machine: ${machine.name}. Alert: ${alert.title}. Evidence signals found:\n${signals
      .map((s) => `- ${s.title}: ${s.detail}`)
      .join('\n')}`,
  );
  const summary = geminiSummary ?? fallbackSummary;

  await prisma.$transaction(async (tx) => {
    await investigationRepository.createWithChildren(
      {
        investigation: {
          id: investigationId,
          alertId,
          title: `Investigation: ${alert.title}`,
          factoryId: alert.factoryId,
          lineId: line.id,
          lineName: line.name,
          machineId: machine.id,
          machineName: machine.name,
          productId,
          productName,
          shift: 'N/A',
          startTime: alert.detectedAt,
          duration: 'Ongoing',
          outputVariancePct: 0,
          status: 'Active',
          summary,
          timeline: [
            {
              time: 'Just now',
              source: 'System',
              event: 'Investigation generated from available live telemetry and correlated records.',
              impactLevel: 'medium',
            },
          ],
          sensorDeltas: signals
            .filter((s) => s.kind === 'Machine')
            .map((s) => ({
              parameter: 'Vibration',
              baseline: `${thresholds?.vibrationAnomalyMmS} mm/s (threshold)`,
              current: s.delta,
              changePct: s.delta,
              isAbnormal: true,
              unit: 'mm/s',
            })),
        },
        rootCauses,
        evidence,
        businessImpact,
      },
      tx,
    );

    await recommendedActionRepository.createMany(recommendations, tx);
    await alertRepository.updateStatus(alertId, 'Investigating', {}, tx);

    await incidentEventRepository.create(
      {
        alertId,
        eventType: 'InvestigationGenerated',
        fromStatus: alert.status,
        toStatus: 'Investigating',
        message: `AI investigation generated from ${signals.length} evidence signal${signals.length > 1 ? 's' : ''}.`,
      },
      tx,
    );
  });

  const created = await investigationRepository.findById(investigationId);
  if (!created) {
    throw new Error('Investigation was created but could not be re-fetched.');
  }
  return created;
}
