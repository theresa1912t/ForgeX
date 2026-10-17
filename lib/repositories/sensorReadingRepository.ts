import { prisma } from '@/lib/prisma';
import type { DbClient } from './types';

export async function create(
  data: { machineId: string; metricKey: string; value: number; unit: string },
  client: DbClient = prisma,
) {
  return client.sensorReading.create({ data });
}

export async function findRecentByMachine(
  machineId: string,
  limit = 50,
  client: DbClient = prisma,
) {
  return client.sensorReading.findMany({
    where: { machineId },
    orderBy: { recordedAt: 'desc' },
    take: limit,
  });
}

export async function findLatest(
  machineId: string,
  metricKey: string,
  client: DbClient = prisma,
) {
  return client.sensorReading.findFirst({
    where: { machineId, metricKey },
    orderBy: { recordedAt: 'desc' },
  });
}

// Which machines have at least one reading for a metric — avoids hardcoding to a specific
// machine id; naturally extends if the simulator ever covers more machines.
export async function findDistinctMachineIds(metricKey: string, client: DbClient = prisma) {
  const rows = await client.sensorReading.findMany({
    where: { metricKey },
    distinct: ['machineId'],
    select: { machineId: true },
  });
  return rows.map((row) => row.machineId);
}

// Retention cleanup — there's no retention limit on writes (every message the ingestor receives
// gets its own row), so something has to periodically trim old rows. See scripts/mqttIngestor.ts.
export async function deleteOlderThan(cutoff: Date, client: DbClient = prisma) {
  return client.sensorReading.deleteMany({ where: { recordedAt: { lt: cutoff } } });
}
