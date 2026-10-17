import { randomUUID } from 'crypto';
import { $Enums, type Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { alertStatusMap, alertStatusReverseMap } from '@/prisma/enumMaps';
import { initialAlerts } from '@/lib/mockData';
import { safeDb } from './safeDb';
import type { Alert, AlertStatus } from '@/lib/types';
import type { DbClient } from './types';

// Explicit return type: the inferred one doesn't reflect the enum->display-string remap this
// actually does at runtime (a pre-existing repository-layer typing gap), which otherwise makes
// TypeScript reject passing an app-level-typed fallback (e.g. mock data) alongside this result.
function serialize<
  T extends {
    status: $Enums.AlertStatus;
    machineId: string | null;
    machineName: string | null;
    productId: string | null;
    productName: string | null;
    resolvedAt: string | null;
  },
>(
  row: T,
): Omit<T, 'status' | 'machineId' | 'machineName' | 'productId' | 'productName' | 'resolvedAt'> & {
  status: AlertStatus;
  machineId?: Alert['machineId'];
  machineName?: Alert['machineName'];
  productId?: Alert['productId'];
  productName?: Alert['productName'];
  resolvedAt?: Alert['resolvedAt'];
} {
  const { status, machineId, machineName, productId, productName, resolvedAt, ...rest } = row;
  return {
    ...rest,
    status: alertStatusReverseMap[status],
    machineId: machineId ?? undefined,
    machineName: machineName ?? undefined,
    productId: productId ?? undefined,
    productName: productName ?? undefined,
    resolvedAt: resolvedAt ?? undefined,
  };
}

function serializeWithInvestigation<
  T extends {
    status: $Enums.AlertStatus;
    machineId: string | null;
    machineName: string | null;
    productId: string | null;
    productName: string | null;
    resolvedAt: string | null;
    investigation: { id: string } | null;
  },
>(
  row: T,
): Omit<T, 'status' | 'machineId' | 'machineName' | 'productId' | 'productName' | 'resolvedAt' | 'investigation'> & {
  status: AlertStatus;
  machineId?: Alert['machineId'];
  machineName?: Alert['machineName'];
  productId?: Alert['productId'];
  productName?: Alert['productName'];
  resolvedAt?: Alert['resolvedAt'];
  investigationId?: string;
} {
  const { status, machineId, machineName, productId, productName, resolvedAt, investigation, ...rest } = row;
  return {
    ...rest,
    status: alertStatusReverseMap[status],
    machineId: machineId ?? undefined,
    machineName: machineName ?? undefined,
    productId: productId ?? undefined,
    productName: productName ?? undefined,
    resolvedAt: resolvedAt ?? undefined,
    investigationId: investigation?.id,
  };
}

const WITH_INVESTIGATION = { investigation: { select: { id: true } } } as const;

export async function findAll(client: DbClient = prisma) {
  return safeDb(
    async () => {
      const rows = await client.alert.findMany({ include: WITH_INVESTIGATION, orderBy: { id: 'asc' } });
      return rows.map(serializeWithInvestigation);
    },
    initialAlerts
  );
}

export async function findById(id: string, client: DbClient = prisma) {
  return safeDb(
    async () => {
      const row = await client.alert.findUnique({ where: { id }, include: WITH_INVESTIGATION });
      return row ? serializeWithInvestigation(row) : null;
    },
    () => initialAlerts.find((a) => a.id === id) || initialAlerts[0]
  );
}

export async function create(data: Omit<Alert, 'id'>, client: DbClient = prisma) {
  const alertId = `alert-user-${randomUUID()}`;
  return safeDb(
    async () => {
      const row = await client.alert.create({
        data: {
          id: alertId,
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
    },
    () => ({ id: alertId, ...data })
  );
}

export async function findActiveByMachine(machineId: string, client: DbClient = prisma) {
  return safeDb(
    async () => {
      const row = await client.alert.findFirst({
        where: {
          machineId,
          status: { notIn: [alertStatusMap['Resolved'], alertStatusMap['Dismissed']] },
        },
      });
      return row ? serialize(row) : null;
    },
    () =>
      initialAlerts.find(
        (a) => a.machineId === machineId && a.status !== 'Resolved' && a.status !== 'Dismissed',
      ) || null
  );
}

// The most recently resolved/dismissed alert for this machine — used by the "recurring fault"
// simulation scenario (need-checking.md §9) to reopen a past incident instead of fabricating an
// unrelated new one, when one actually exists to reopen.
export async function findLatestResolvedByMachine(machineId: string, client: DbClient = prisma) {
  const row = await client.alert.findFirst({
    where: {
      machineId,
      status: { in: [alertStatusMap['Resolved'], alertStatusMap['Dismissed']] },
    },
    orderBy: { id: 'desc' },
  });
  return row ? serialize(row) : null;
}

export async function updateStatus(
  id: string,
  status: AlertStatus,
  extra: { resolvedAt?: string } = {},
  client: DbClient = prisma,
) {
  return safeDb(
    async () => {
      const row = await client.alert.update({
        where: { id },
        data: { status: alertStatusMap[status], ...extra },
      });
      return serialize(row);
    },
    () => {
      const existing = initialAlerts.find((a) => a.id === id) || initialAlerts[0];
      return { ...existing, status, ...extra };
    }
  );
}

export async function deleteAll(client: DbClient = prisma) {
  return safeDb(() => client.alert.deleteMany({}), { count: 0 });
}

export async function createMany(rows: Prisma.AlertCreateManyInput[], client: DbClient = prisma) {
  return safeDb(() => client.alert.createMany({ data: rows }), { count: rows.length });
}
