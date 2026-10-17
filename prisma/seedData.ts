import type { Prisma } from '@prisma/client';
import bcrypt from 'bcryptjs';
import {
  initialOrganization,
  initialFactories,
  initialUsers,
  initialProducts,
  initialMaterials,
  initialMaterialBatches,
  initialProductionLines,
  initialMachines,
  initialAlerts,
  heroInvestigation,
  initialActionTasks,
  initialNotifications,
  initialMaintenanceRecords,
  initialDowntimeRecords,
  initialWasteRecords,
  initialIngredientUsageRecords,
  initialEnergyRecords,
  initialQualityRecords,
  initialThresholds,
} from '../lib/mockData';
import { initialDeviceConnections, initialMachineProfiles } from '../lib/connectivityData';
import {
  machineStatusMap,
  batchStatusMap,
  alertStatusMap,
  rootCauseStatusMap,
  recommendationStatusMap,
  actionTaskStatusMap,
  maintenanceStatusMap,
  downtimeCategoryMap,
  ingredientStatusMap,
  wasteDefectCategoryMap,
  wasteReasonMap,
  protocolMap,
} from './enumMaps';

export function buildOrganizationRow() {
  return { ...initialOrganization };
}

export function buildFactoryRows() {
  return initialFactories;
}

// Single shared demo password for every seeded persona — there's no signup flow in this
// single-tenant demo, so one documented password covering all seeded emails is simplest.
export const DEMO_PASSWORD = 'ForgeX-Demo-2026!';

export function buildUserRows() {
  const passwordHash = bcrypt.hashSync(DEMO_PASSWORD, 10);
  return initialUsers.map((u) => ({ ...u, passwordHash }));
}

export function buildProductRows() {
  return initialProducts;
}

export function buildMaterialRows() {
  return initialMaterials;
}

export function buildMaterialBatchRows() {
  return initialMaterialBatches.map((b) => ({
    ...b,
    status: batchStatusMap[b.status],
  }));
}

export function buildProductionLineRows() {
  return initialProductionLines;
}

// Hourly production_metrics history (need-checking.md §7) for the hero machine, covering the
// past 24 hours: a healthy run tapering into the current degraded state, so there's a real
// historical series to query instead of only ever a live current snapshot. Not wired into
// resetDemoState — this is seed-once history, not part of the hero incident's resettable state.
export function buildProductionMetricRows(): Prisma.ProductionMetricCreateManyInput[] {
  const machineId = 'mach-m03';
  const targetUnitsPerHour = 5400;
  const unitRevenue = 1.65;
  const now = new Date();
  const rows: Prisma.ProductionMetricCreateManyInput[] = [];

  for (let hoursAgo = 23; hoursAgo >= 0; hoursAgo -= 1) {
    const intervalEnd = new Date(now.getTime() - hoursAgo * 60 * 60 * 1000);
    const intervalStart = new Date(intervalEnd.getTime() - 60 * 60 * 1000);
    // Degradation begins ~4 hours ago, matching the hero incident's detected time.
    const isDegraded = hoursAgo <= 4;
    const actualUnits = isDegraded ? 4380 : 5340;
    const defectRatePct = isDegraded ? 2.12 : 0.6;
    const defectiveUnits = Math.round(actualUnits * (defectRatePct / 100));

    rows.push({
      machineId,
      intervalStart,
      intervalEnd,
      expectedUnits: targetUnitsPerHour,
      actualUnits,
      goodUnits: actualUnits - defectiveUnits,
      defectiveUnits,
      unitRevenue,
      source: 'Seed',
    });
  }

  return rows;
}

export function buildMachineRows() {
  return initialMachines.map((m) => ({
    ...m,
    status: machineStatusMap[m.status],
  }));
}

export function buildThresholdsRow(factoryId: string) {
  return { ...initialThresholds, factoryId };
}

export function buildAlertRows() {
  return initialAlerts.map(({ investigationId: _investigationId, ...rest }) => ({
    ...rest,
    status: alertStatusMap[rest.status],
  }));
}

export function buildHeroInvestigationParts() {
  const { rootCauses, evidence, businessImpact, recommendations, ...investigationRest } =
    heroInvestigation;

  return {
    investigation: {
      ...investigationRest,
      timeline: investigationRest.timeline as unknown as Prisma.InputJsonValue,
      sensorDeltas: investigationRest.sensorDeltas as unknown as Prisma.InputJsonValue,
      resolutionOutcome: (investigationRest.resolutionOutcome ?? undefined) as
        | Prisma.InputJsonValue
        | undefined,
    },
    rootCauses: rootCauses.map((rc) => ({
      ...rc,
      investigationId: heroInvestigation.id,
      status: rootCauseStatusMap[rc.status],
    })),
    evidence: evidence.map((ev) => ({ ...ev, investigationId: heroInvestigation.id })),
    businessImpact: { ...businessImpact, investigationId: heroInvestigation.id },
    recommendations: recommendations.map((rec) => ({
      ...rec,
      status: recommendationStatusMap[rec.status],
    })),
  };
}

export function buildActionTaskRows() {
  return initialActionTasks.map((t) => ({
    ...t,
    investigationId: t.investigationId || null,
    status: actionTaskStatusMap[t.status],
  }));
}

// initialNotifications is already ordered newest-first (matches its "timestamp" display strings,
// e.g. "10:42 AM" before "Yesterday 04:30 PM") — createdAt just needs to preserve that same
// relative order for real sorting, spaced far enough apart that any notification created later
// through the running app naturally sorts above all of these.
export function buildNotificationRows() {
  const base = Date.now();
  return initialNotifications.map((n, idx) => ({
    ...n,
    createdAt: new Date(base - idx * 60_000),
  }));
}

export function buildMaintenanceRecordRows() {
  return initialMaintenanceRecords.map((r) => ({
    ...r,
    status: maintenanceStatusMap[r.status],
  }));
}

export function buildDowntimeRecordRows() {
  return initialDowntimeRecords.map((d) => ({
    ...d,
    category: downtimeCategoryMap[d.category],
  }));
}

export function buildIngredientUsageRecordRows() {
  return initialIngredientUsageRecords.map((r) => ({
    ...r,
    status: ingredientStatusMap[r.status],
  }));
}

export function buildWasteRecordRows() {
  return initialWasteRecords.map((r) => ({
    ...r,
    materialId: r.materialId ?? null,
    defectCategory: r.defectCategory ? wasteDefectCategoryMap[r.defectCategory] : null,
    wasteReason: wasteReasonMap[r.wasteReason],
  }));
}

export function buildEnergyRecordRows() {
  return initialEnergyRecords;
}

export function buildQualityRecordRows() {
  return initialQualityRecords;
}

export function buildDeviceConnectionRows() {
  return initialDeviceConnections.map((c) => ({
    ...c,
    protocol: protocolMap[c.protocol],
  }));
}

export function buildMachineConnectivityProfileInputs() {
  const existingMachineIds = new Set(initialMachines.map((m) => m.id));
  return Object.values(initialMachineProfiles)
    .filter((profile) => {
      if (!existingMachineIds.has(profile.machineId)) {
        console.warn(
          `Skipping connectivity profile for ${profile.machineId}: no matching Machine record (stale demo data).`,
        );
        return false;
      }
      return true;
    })
    .map((profile) => ({
      machineId: profile.machineId,
      plcType: profile.plcType,
      ipAddress: profile.ipAddress,
      gatewayId: profile.gatewayId,
      protocol: protocolMap[profile.protocol],
      lastTelemetryTimestamp: profile.lastTelemetryTimestamp,
      healthScoreMethodology: profile.healthScoreMethodology as unknown as Prisma.InputJsonValue,
      tags: profile.tags.map((tag) => ({
        metricKey: tag.metricKey,
        label: tag.label,
        tagAddress: tag.tagAddress,
        dataType: tag.dataType,
        samplingRateHz: tag.samplingRateHz,
        lastRawValue: String(tag.lastRawValue),
        unit: tag.unit,
        sourceGateway: tag.sourceGateway,
        status: tag.status,
      })),
    }));
}
