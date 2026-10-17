import { randomUUID } from 'crypto';
import { $Enums, type Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { protocolMap, protocolReverseMap } from '@/prisma/enumMaps';
import { initialDeviceConnections } from '@/lib/connectivityData';
import { safeDb } from './safeDb';
import type { DeviceConnection } from '@/lib/types';
import type { DbClient } from './types';

function serialize<T extends { protocol: $Enums.ProtocolType }>(row: T) {
  return { ...row, protocol: protocolReverseMap[row.protocol] };
}

export async function findAll(client: DbClient = prisma) {
  return safeDb(
    async () => {
      const rows = await client.deviceConnection.findMany({ orderBy: { id: 'asc' } });
      return rows.map(serialize);
    },
    initialDeviceConnections
  );
}

export async function findById(id: string, client: DbClient = prisma) {
  return safeDb(
    async () => {
      const row = await client.deviceConnection.findUnique({ where: { id } });
      return row ? serialize(row) : null;
    },
    () => initialDeviceConnections.find((c) => c.id === id) || initialDeviceConnections[0]
  );
}

export async function create(data: Omit<DeviceConnection, 'id'>, client: DbClient = prisma) {
  const connId = `conn-user-${randomUUID()}`;
  return safeDb(
    async () => {
      const row = await client.deviceConnection.create({
        data: {
          id: connId,
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
    },
    () => ({ id: connId, ...data })
  );
}

export async function updateTestResult(
  id: string,
  result: { status: 'connected' | 'error'; lastHeartbeat: string; pingLatencyMs: number },
  client: DbClient = prisma,
) {
  return safeDb(
    async () => {
      const row = await client.deviceConnection.update({
        where: { id },
        data: result,
      });
      return serialize(row);
    },
    () => {
      const existing = initialDeviceConnections.find((c) => c.id === id) || initialDeviceConnections[0];
      return { ...existing, ...result };
    }
  );
}

export async function deleteAll(client: DbClient = prisma) {
  return safeDb(() => client.deviceConnection.deleteMany({}), { count: 0 });
}

export async function createMany(
  rows: Prisma.DeviceConnectionCreateManyInput[],
  client: DbClient = prisma,
) {
  return safeDb(() => client.deviceConnection.createMany({ data: rows }), { count: rows.length });
}
