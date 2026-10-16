import { randomUUID } from 'crypto';
import { $Enums, type Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { protocolMap, protocolReverseMap } from '@/prisma/enumMaps';
import type { DeviceConnection } from '@/lib/types';
import type { DbClient } from './types';

function serialize<T extends { protocol: $Enums.ProtocolType }>(row: T) {
  return { ...row, protocol: protocolReverseMap[row.protocol] };
}

export async function findAll(client: DbClient = prisma) {
  const rows = await client.deviceConnection.findMany();
  return rows.map(serialize);
}

export async function findById(id: string, client: DbClient = prisma) {
  const row = await client.deviceConnection.findUnique({ where: { id } });
  return row ? serialize(row) : null;
}

export async function create(data: Omit<DeviceConnection, 'id'>, client: DbClient = prisma) {
  const row = await client.deviceConnection.create({
    data: {
      id: `conn-user-${randomUUID()}`,
      name: data.name,
      protocol: protocolMap[data.protocol],
      endpointUrl: data.endpointUrl,
      status: data.status,
      pollingFrequencyMs: data.pollingFrequencyMs,
      lastHeartbeat: data.lastHeartbeat,
      pingLatencyMs: data.pingLatencyMs,
      securityMode: data.securityMode,
      assignedMachines: data.assignedMachines ?? [],
    },
  });
  return serialize(row);
}

export async function updateTestResult(
  id: string,
  data: { status: DeviceConnection['status']; pingLatencyMs: number; lastHeartbeat: string },
  client: DbClient = prisma,
) {
  const row = await client.deviceConnection.update({ where: { id }, data });
  return serialize(row);
}

// Bulk reset/seed path: rows are already Prisma-shaped (built by prisma/seedData.ts).
export async function deleteAll(client: DbClient = prisma) {
  return client.deviceConnection.deleteMany({});
}

export async function createMany(
  rows: Prisma.DeviceConnectionCreateManyInput[],
  client: DbClient = prisma,
) {
  return client.deviceConnection.createMany({ data: rows });
}
