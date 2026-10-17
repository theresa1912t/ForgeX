import { prisma } from '@/lib/prisma';
import { initialProductionLines, initialMachines } from '@/lib/mockData';
import * as productionLineRepository from '@/lib/repositories/productionLineRepository';
import * as machineRepository from '@/lib/repositories/machineRepository';
import * as alertRepository from '@/lib/repositories/alertRepository';
import * as investigationRepository from '@/lib/repositories/investigationRepository';
import * as recommendedActionRepository from '@/lib/repositories/recommendedActionRepository';
import * as actionTaskRepository from '@/lib/repositories/actionTaskRepository';
import * as notificationRepository from '@/lib/repositories/notificationRepository';
import * as maintenanceRecordRepository from '@/lib/repositories/maintenanceRecordRepository';
import * as deviceConnectionRepository from '@/lib/repositories/deviceConnectionRepository';
import * as machineConnectivityProfileRepository from '@/lib/repositories/machineConnectivityProfileRepository';
import * as wasteRecordRepository from '@/lib/repositories/wasteRecordRepository';
import * as ingredientUsageRecordRepository from '@/lib/repositories/ingredientUsageRecordRepository';
import * as incidentEventRepository from '@/lib/repositories/incidentEventRepository';
import {
  buildAlertRows,
  buildHeroInvestigationParts,
  buildActionTaskRows,
  buildNotificationRows,
  buildMaintenanceRecordRows,
  buildDeviceConnectionRows,
  buildMachineConnectivityProfileInputs,
  buildWasteRecordRows,
  buildIngredientUsageRecordRows,
} from '@/prisma/seedData';

// Mirrors factoryStore.tsx's `resetDemoToHeroState`: a *partial* reset. Only the tables that
// function replaces (production lines, machines, alerts, the hero investigation + children,
// action tasks, notifications, maintenance records, device connections, connectivity profiles,
// waste records, ingredient usage records) are touched — materials, products, users, etc. are
// left alone, exactly as in the client-side version.
//
// ProductionLine/Machine are reset via UPDATE rather than delete+recreate: DowntimeRecord (which
// this reset does NOT touch) holds a required foreign key into both, so deleting them would
// violate that constraint.
export async function resetDemoState() {
  await prisma.$transaction(async (tx) => {
    // Delete children-first, in FK-safe order.
    await actionTaskRepository.deleteAll(tx);
    await recommendedActionRepository.deleteAll(tx);
    await investigationRepository.deleteAllChildren(tx);
    await investigationRepository.deleteAll(tx);
    await incidentEventRepository.deleteAll(tx);
    await alertRepository.deleteAll(tx);
    await machineConnectivityProfileRepository.deleteAll(tx);
    await deviceConnectionRepository.deleteAll(tx);
    await wasteRecordRepository.deleteAll(tx);
    await ingredientUsageRecordRepository.deleteAll(tx);
    await maintenanceRecordRepository.deleteAll(tx);
    await notificationRepository.deleteAll(tx);

    for (const { id, ...data } of initialProductionLines) {
      await productionLineRepository.update(id, data, tx);
    }
    for (const { id, ...data } of initialMachines) {
      await machineRepository.update(id, data, tx);
    }

    await alertRepository.createMany(buildAlertRows(), tx);

    const { investigation, rootCauses, evidence, businessImpact, recommendations } =
      buildHeroInvestigationParts();
    await investigationRepository.createWithChildren(
      { investigation, rootCauses, evidence, businessImpact },
      tx,
    );
    await recommendedActionRepository.createMany(recommendations, tx);

    await actionTaskRepository.createMany(buildActionTaskRows(), tx);
    await notificationRepository.createMany(buildNotificationRows(), tx);
    await maintenanceRecordRepository.createMany(buildMaintenanceRecordRows(), tx);
    await deviceConnectionRepository.createMany(buildDeviceConnectionRows(), tx);
    await machineConnectivityProfileRepository.createManyWithTags(
      buildMachineConnectivityProfileInputs(),
      tx,
    );
    await wasteRecordRepository.createMany(buildWasteRecordRows(), tx);
    await ingredientUsageRecordRepository.createMany(buildIngredientUsageRecordRows(), tx);
  });
}
