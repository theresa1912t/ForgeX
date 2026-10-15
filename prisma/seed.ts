import { PrismaClient, $Enums } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
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
import {
  initialDeviceConnections,
  initialMachineProfiles,
} from '../lib/connectivityData';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const machineStatusMap: Record<string, $Enums.MachineStatus> = {
  'Normal': 'Normal',
  'Abnormal Behavior': 'AbnormalBehavior',
  'Elevated Risk': 'ElevatedRisk',
  'Offline': 'Offline',
};

const batchStatusMap: Record<string, $Enums.MaterialBatchStatus> = {
  'Approved': 'Approved',
  'Quarantine': 'Quarantine',
  'In Use': 'InUse',
  'Flagged': 'Flagged',
};

const alertStatusMap: Record<string, $Enums.AlertStatus> = {
  'New': 'New',
  'Investigating': 'Investigating',
  'Action Required': 'ActionRequired',
  'In Progress': 'InProgress',
  'Resolved': 'Resolved',
  'Dismissed': 'Dismissed',
};

const rootCauseStatusMap: Record<string, $Enums.RootCauseStatus> = {
  'Likely Contributor': 'LikelyContributor',
  'Secondary Factor': 'SecondaryFactor',
  'Ruled Out': 'RuledOut',
  'Under Review': 'UnderReview',
};

const recommendationStatusMap: Record<string, $Enums.RecommendationStatus> = {
  'Pending': 'Pending',
  'Approved': 'Approved',
  'Rejected': 'Rejected',
  'Task Created': 'TaskCreated',
};

const actionTaskStatusMap: Record<string, $Enums.ActionTaskStatus> = {
  'Pending': 'Pending',
  'Assigned': 'Assigned',
  'In Progress': 'InProgress',
  'Completed': 'Completed',
  'Cancelled': 'Cancelled',
};

const maintenanceStatusMap: Record<string, $Enums.MaintenanceStatus> = {
  'Completed': 'Completed',
  'Scheduled': 'Scheduled',
  'In Progress': 'InProgress',
};

const downtimeCategoryMap: Record<string, $Enums.DowntimeCategory> = {
  'Equipment failure': 'EquipmentFailure',
  'Setup / changeover': 'SetupChangeover',
  'Material shortage': 'MaterialShortage',
  'Quality issue': 'QualityIssue',
  'Operator issue': 'OperatorIssue',
  'Planned maintenance': 'PlannedMaintenance',
  'Other': 'Other',
};

const ingredientStatusMap: Record<string, $Enums.IngredientUsageStatus> = {
  'Normal': 'Normal',
  'Variance Warning': 'VarianceWarning',
  'Anomaly Loss': 'AnomalyLoss',
};

const wasteDefectCategoryMap: Record<string, $Enums.WasteDefectCategory> = {
  'Overfill/Spill': 'OverfillSpill',
  'Contamination': 'Contamination',
  'Underfill Rejection': 'UnderfillRejection',
  'Startup Purge': 'StartupPurge',
  'Packaging Tear': 'PackagingTear',
  'Off-Spec Viscosity': 'OffSpecViscosity',
};

const wasteReasonMap: Record<string, $Enums.WasteReason> = {
  'Expired': 'Expired',
  'Spoiled': 'Spoiled',
  'Overproduction': 'Overproduction',
  'Preparation mistake': 'PreparationMistake',
  'Wrong order': 'WrongOrder',
  'Damaged': 'Damaged',
  'Process loss': 'ProcessLoss',
  'Other': 'Other',
};

const protocolMap: Record<string, $Enums.ProtocolType> = {
  'OPC-UA': 'OPC_UA',
  'MQTT': 'MQTT',
  'Modbus-TCP': 'Modbus_TCP',
  'REST-Historian': 'REST_Historian',
};

async function main() {
  console.log('Seeding organization, factories, users...');
  await prisma.organization.create({ data: { ...initialOrganization } });
  await prisma.factory.createMany({ data: initialFactories });
  await prisma.user.createMany({ data: initialUsers });

  console.log('Seeding products and materials...');
  await prisma.product.createMany({ data: initialProducts });
  await prisma.material.createMany({
    data: initialMaterials.map((m) => ({ ...m, qualityStatus: m.qualityStatus })),
  });
  await prisma.materialBatch.createMany({
    data: initialMaterialBatches.map((b) => ({
      ...b,
      status: batchStatusMap[b.status],
    })),
  });

  console.log('Seeding production lines and machines...');
  await prisma.productionLine.createMany({ data: initialProductionLines });
  await prisma.machine.createMany({
    data: initialMachines.map((m) => ({
      ...m,
      status: machineStatusMap[m.status],
    })),
  });

  console.log('Seeding operational thresholds...');
  await prisma.operationalThresholds.create({
    data: { ...initialThresholds, factoryId: 'fac-main' },
  });

  console.log('Seeding alerts...');
  for (const alert of initialAlerts) {
    const { investigationId, ...rest } = alert;
    await prisma.alert.create({
      data: { ...rest, status: alertStatusMap[alert.status] },
    });
  }

  console.log('Seeding hero investigation and children...');
  const {
    rootCauses,
    evidence,
    businessImpact,
    recommendations,
    ...investigationRest
  } = heroInvestigation;

  await prisma.investigation.create({
    data: {
      ...investigationRest,
      status: investigationRest.status,
      timeline: investigationRest.timeline as object,
      sensorDeltas: investigationRest.sensorDeltas as object,
      resolutionOutcome: investigationRest.resolutionOutcome ?? undefined,
    },
  });

  await prisma.rootCause.createMany({
    data: rootCauses.map((rc) => ({
      ...rc,
      investigationId: heroInvestigation.id,
      status: rootCauseStatusMap[rc.status],
    })),
  });

  await prisma.evidenceItem.createMany({
    data: evidence.map((ev) => ({ ...ev, investigationId: heroInvestigation.id })),
  });

  await prisma.businessImpact.create({
    data: { ...businessImpact, investigationId: heroInvestigation.id },
  });

  await prisma.recommendedAction.createMany({
    data: recommendations.map((rec) => ({
      ...rec,
      status: recommendationStatusMap[rec.status],
    })),
  });

  console.log('Seeding action tasks...');
  await prisma.actionTask.createMany({
    data: initialActionTasks.map((t) => ({
      ...t,
      investigationId: t.investigationId || null,
      status: actionTaskStatusMap[t.status],
    })),
  });

  console.log('Seeding notifications...');
  await prisma.notificationItem.createMany({ data: initialNotifications });

  console.log('Seeding maintenance & downtime records...');
  await prisma.maintenanceRecord.createMany({
    data: initialMaintenanceRecords.map((r) => ({
      ...r,
      status: maintenanceStatusMap[r.status],
    })),
  });
  await prisma.downtimeRecord.createMany({
    data: initialDowntimeRecords.map((d) => ({
      ...d,
      category: downtimeCategoryMap[d.category],
    })),
  });

  console.log('Seeding ingredient usage, waste, energy, and quality records...');
  await prisma.ingredientUsageRecord.createMany({
    data: initialIngredientUsageRecords.map((r) => ({
      ...r,
      status: ingredientStatusMap[r.status],
    })),
  });
  await prisma.wasteRecord.createMany({
    data: initialWasteRecords.map((r) => ({
      ...r,
      materialId: r.materialId ?? null,
      defectCategory: r.defectCategory ? wasteDefectCategoryMap[r.defectCategory] : null,
      wasteReason: wasteReasonMap[r.wasteReason],
    })),
  });
  await prisma.energyRecord.createMany({ data: initialEnergyRecords });
  await prisma.qualityRecord.createMany({ data: initialQualityRecords });

  console.log('Seeding device connections and connectivity profiles...');
  await prisma.deviceConnection.createMany({
    data: initialDeviceConnections.map((c) => ({
      ...c,
      protocol: protocolMap[c.protocol],
    })),
  });

  const existingMachineIds = new Set(initialMachines.map((m) => m.id));
  for (const profile of Object.values(initialMachineProfiles)) {
    if (!existingMachineIds.has(profile.machineId)) {
      console.warn(
        `Skipping connectivity profile for ${profile.machineId}: no matching Machine record (stale demo data).`,
      );
      continue;
    }
    await prisma.machineConnectivityProfile.create({
      data: {
        machineId: profile.machineId,
        plcType: profile.plcType,
        ipAddress: profile.ipAddress,
        gatewayId: profile.gatewayId,
        protocol: protocolMap[profile.protocol],
        lastTelemetryTimestamp: profile.lastTelemetryTimestamp,
        healthScoreMethodology: profile.healthScoreMethodology as object,
        tags: {
          create: profile.tags.map((tag) => ({
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
        },
      },
    });
  }

  console.log('Seed complete.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
