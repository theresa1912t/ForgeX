import { randomUUID } from 'crypto';
import { $Enums, type Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { alertStatusMap, alertStatusReverseMap } from '@/prisma/enumMaps';
import type { Alert, AlertStatus } from '@/lib/types';
import type { DbClient } from './types';

function serialize<T extends { status: $Enums.AlertStatus }>(row: T) {
  return { ...row, status: alertStatusReverseMap[row.status] };
}

// The investigationId FK actually lives on Investigation.alertId (unique), not as a column on
// Alert — so reading it back requires including the back-relation and flattening it ourselves.
function serializeWithInvestigation<
  T extends { status: $Enums.AlertStatus; investigation: { id: string } | null },
>(row: T) {
  const { investigation, ...rest } = row;
  return { ...serialize(rest), investigationId: investigation?.id };
}

const WITH_INVESTIGATION = { investigation: { select: { id: true } } } as const;

export async function findAll(client: DbClient = prisma) {
  const rows = await client.alert.findMany({ include: WITH_INVESTIGATION, orderBy: { id: 'asc' } });
  return rows.map(serializeWithInvestigation);
}

export async function findById(id: string, client: DbClient = prisma) {
  const row = await client.alert.findUnique({ where: { id }, include: WITH_INVESTIGATION });
  return row ? serializeWithInvestigation(row) : null;
}

export async function create(data: Omit<Alert, 'id'>, client: DbClient = prisma) {
  const row = await client.alert.create({
    data: {
      id: `alert-user-${randomUUID()}`,
      title: data.title,
      severity: data.severity,
      category: data.category,
      description: data.description,
      factoryId: data.factoryId,
      lineId: data.lineId,
      lineName: data.lineName,
      machineId: data.machineId ?? null,
      machineName: data.machineName ?? null,
      productId: data.productId ?? null,
      productName: data.productName ?? null,
      detectedAt: data.detectedAt,
      estimatedImpact: data.estimatedImpact,
      revenueAtRisk: data.revenueAtRisk,
      confidence: data.confidence,
      status: alertStatusMap[data.status],
    },
  });
  return serialize(row);
}

// Any unresolved alert for this machine, regardless of category — used to avoid creating a
// redundant alert when one (seeded or engine-created) is already open for the same machine.
export async function findActiveByMachine(machineId: string, client: DbClient = prisma) {
  const row = await client.alert.findFirst({
    where: {
      machineId,
      status: { notIn: [alertStatusMap['Resolved'], alertStatusMap['Dismissed']] },
    },
  });
  return row ? serialize(row) : null;
}

export async function updateStatus(
  id: string,
  status: AlertStatus,
  extra: { resolvedAt?: string } = {},
  client: DbClient = prisma,
) {
  const row = await client.alert.update({
    where: { id },
    data: { status: alertStatusMap[status], ...extra },
  });
  return serialize(row);
}

// Bulk reset/seed path: rows are already Prisma-shaped (built by prisma/seedData.ts).
export async function deleteAll(client: DbClient = prisma) {
  return client.alert.deleteMany({});
}

export async function createMany(rows: Prisma.AlertCreateManyInput[], client: DbClient = prisma) {
  return client.alert.createMany({ data: rows });
}
