import type { Prisma } from '@prisma/client';
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

export function buildUserRows() {
  return initialUsers;
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

export function buildNotificationRows() {
  return initialNotifications;
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
