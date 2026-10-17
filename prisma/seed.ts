import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import {
  buildOrganizationRow,
  buildFactoryRows,
  buildUserRows,
  buildProductRows,
  buildMaterialRows,
  buildMaterialBatchRows,
  buildProductionLineRows,
  buildMachineRows,
  buildThresholdsRow,
  buildAlertRows,
  buildHeroInvestigationParts,
  buildActionTaskRows,
  buildNotificationRows,
  buildMaintenanceRecordRows,
  buildDowntimeRecordRows,
  buildIngredientUsageRecordRows,
  buildWasteRecordRows,
  buildEnergyRecordRows,
  buildQualityRecordRows,
  buildDeviceConnectionRows,
  buildMachineConnectivityProfileInputs,
  buildProductionMetricRows,
} from './seedData';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Seeding organization, factories, users...');
  await prisma.organization.create({ data: buildOrganizationRow() });
  await prisma.factory.createMany({ data: buildFactoryRows() });
  await prisma.user.createMany({ data: buildUserRows() });

  console.log('Seeding products and materials...');
  await prisma.product.createMany({ data: buildProductRows() });
  await prisma.material.createMany({ data: buildMaterialRows() });
  await prisma.materialBatch.createMany({ data: buildMaterialBatchRows() });

  console.log('Seeding production lines and machines...');
  await prisma.productionLine.createMany({ data: buildProductionLineRows() });
  await prisma.machine.createMany({ data: buildMachineRows() });

  console.log('Seeding production metrics history...');
  await prisma.productionMetric.createMany({ data: buildProductionMetricRows() });

  console.log('Seeding operational thresholds...');
  await prisma.operationalThresholds.create({ data: buildThresholdsRow('fac-main') });

  console.log('Seeding alerts...');
  await prisma.alert.createMany({ data: buildAlertRows() });

  console.log('Seeding hero investigation and children...');
  const { investigation, rootCauses, evidence, businessImpact, recommendations } =
    buildHeroInvestigationParts();

  await prisma.investigation.create({ data: investigation });
  await prisma.rootCause.createMany({ data: rootCauses });
  await prisma.evidenceItem.createMany({ data: evidence });
  await prisma.businessImpact.create({ data: businessImpact });
  await prisma.recommendedAction.createMany({ data: recommendations });

  console.log('Seeding action tasks...');
  await prisma.actionTask.createMany({ data: buildActionTaskRows() });

  console.log('Seeding notifications...');
  await prisma.notificationItem.createMany({ data: buildNotificationRows() });

  console.log('Seeding maintenance & downtime records...');
  await prisma.maintenanceRecord.createMany({ data: buildMaintenanceRecordRows() });
  await prisma.downtimeRecord.createMany({ data: buildDowntimeRecordRows() });

  console.log('Seeding ingredient usage, waste, energy, and quality records...');
  await prisma.ingredientUsageRecord.createMany({ data: buildIngredientUsageRecordRows() });
  await prisma.wasteRecord.createMany({ data: buildWasteRecordRows() });
  await prisma.energyRecord.createMany({ data: buildEnergyRecordRows() });
  await prisma.qualityRecord.createMany({ data: buildQualityRecordRows() });

  console.log('Seeding device connections and connectivity profiles...');
  await prisma.deviceConnection.createMany({ data: buildDeviceConnectionRows() });

  for (const profile of buildMachineConnectivityProfileInputs()) {
    const { tags, ...profileData } = profile;
    await prisma.machineConnectivityProfile.create({
      data: { ...profileData, tags: { create: tags } },
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
