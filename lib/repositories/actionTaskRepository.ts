import { randomUUID } from 'crypto';
import { $Enums, type Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { actionTaskStatusMap, actionTaskStatusReverseMap } from '@/prisma/enumMaps';
import { initialActionTasks } from '@/lib/mockData';
import { safeDb } from './safeDb';
import type { ActionTask } from '@/lib/types';
import type { DbClient } from './types';

function serialize<T extends { status: $Enums.ActionTaskStatus }>(row: T) {
  return { ...row, status: actionTaskStatusReverseMap[row.status] };
}

export async function findAll(client: DbClient = prisma) {
  return safeDb(
    async () => {
      const rows = await client.actionTask.findMany({ orderBy: { id: 'asc' } });
      return rows.map(serialize);
    },
    initialActionTasks
  );
}

export async function findById(id: string, client: DbClient = prisma) {
  return safeDb(
    async () => {
      const row = await client.actionTask.findUnique({ where: { id } });
      return row ? serialize(row) : null;
    },
    () => initialActionTasks.find((t) => t.id === id) || initialActionTasks[0]
  );
}

export async function findByAlert(alertId: string, client: DbClient = prisma) {
  const rows = await client.actionTask.findMany({ where: { alertId }, orderBy: { id: 'asc' } });
  return rows.map(serialize);
}

export async function findByInvestigation(investigationId: string, client: DbClient = prisma) {
  const rows = await client.actionTask.findMany({ where: { investigationId }, orderBy: { id: 'asc' } });
  return rows.map(serialize);
}

export async function findByInvestigationAndRecommendation(
  investigationId: string,
  recommendationId: string,
  client: DbClient = prisma,
) {
  return safeDb(
    async () => {
      const row = await client.actionTask.findFirst({ where: { investigationId, recommendationId } });
      return row ? serialize(row) : null;
    },
    () => initialActionTasks.find((t) => t.investigationId === investigationId && t.recommendationId === recommendationId) || null
  );
}

export async function create(
  data: Omit<ActionTask, 'id' | 'status' | 'createdAt'> & { status: ActionTask['status'] },
  client: DbClient = prisma,
) {
  const taskId = `tsk-${randomUUID()}`;
  return safeDb(
    async () => {
      const row = await client.actionTask.create({
        data: {
          id: taskId,
          title: data.title,
          description: data.description,
          investigationId: data.investigationId,
          alertId: data.alertId,
          recommendationId: data.recommendationId ?? null,
          lineName: data.lineName,
          machineName: data.machineName,
          priority: data.priority,
          assignedTo: data.assignedTo,
          assignedRole: data.assignedRole,
          dueDate: data.dueDate,
          expectedImpact: data.expectedImpact,
          status: actionTaskStatusMap[data.status],
          createdAt: 'Today (Just now)',
        },
      });
      return serialize(row);
    },
    () => ({ id: taskId, ...data, createdAt: 'Today (Just now)' })
  );
}

export async function update(
  id: string,
  data: { status?: ActionTask['status']; assignedTo?: string; assignedRole?: string },
  client: DbClient = prisma,
) {
  return safeDb(
    async () => {
      const row = await client.actionTask.update({
        where: { id },
        data: {
          status: data.status ? actionTaskStatusMap[data.status] : undefined,
          assignedTo: data.assignedTo,
          assignedRole: data.assignedRole,
        },
      });
      return serialize(row);
    },
    () => {
      const existing = initialActionTasks.find((t) => t.id === id) || initialActionTasks[0];
      return { ...existing, ...data, status: data.status || existing.status };
    }
  );
}

export async function complete(
  id: string,
  data: { actualResult: string; resolutionNotes: string },
  client: DbClient = prisma,
) {
  return safeDb(
    async () => {
      const row = await client.actionTask.update({
        where: { id },
        data: {
          status: actionTaskStatusMap['Completed'],
          actualResult: data.actualResult,
          resolutionNotes: data.resolutionNotes,
          completedAt: 'Just now',
        },
      });
      return serialize(row);
    },
    () => {
      const existing = initialActionTasks.find((t) => t.id === id) || initialActionTasks[0];
      return { ...existing, status: 'Completed', ...data, completedAt: 'Just now' };
    }
  );
}

export async function deleteAll(client: DbClient = prisma) {
  return safeDb(() => client.actionTask.deleteMany({}), { count: 0 });
}

export async function createMany(
  rows: Prisma.ActionTaskCreateManyInput[],
  client: DbClient = prisma,
) {
  return safeDb(() => client.actionTask.createMany({ data: rows }), { count: rows.length });
}
