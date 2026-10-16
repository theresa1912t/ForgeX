import { $Enums } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { protocolReverseMap } from '@/prisma/enumMaps';
import type { buildMachineConnectivityProfileInputs } from '@/prisma/seedData';
import type { DbClient } from './types';

type ProfileInput = ReturnType<typeof buildMachineConnectivityProfileInputs>[number];

function serialize<T extends { protocol: $Enums.ProtocolType }>(row: T) {
  return { ...row, protocol: protocolReverseMap[row.protocol] };
}

export async function findAll(client: DbClient = prisma) {
  const rows = await client.machineConnectivityProfile.findMany({ include: { tags: true } });
  return rows.map(serialize);
}

export async function findByMachineId(machineId: string, client: DbClient = prisma) {
  const row = await client.machineConnectivityProfile.findUnique({
    where: { machineId },
  });
  return row ? serialize(row) : null;
}

export async function updateGateway(
  machineId: string,
  gatewayId: string,
  client: DbClient = prisma,
) {
  const row = await client.machineConnectivityProfile.update({
    where: { machineId },
    data: { gatewayId },
    include: { tags: true },
  });
  return serialize(row);
}

// Bulk reset/seed path: inputs are already Prisma-shaped (built by prisma/seedData.ts).
export async function deleteAll(client: DbClient = prisma) {
  await client.sensorTagMapping.deleteMany({});
  await client.machineConnectivityProfile.deleteMany({});
}

export async function createManyWithTags(profiles: ProfileInput[], client: DbClient = prisma) {
  for (const profile of profiles) {
    const { tags, ...profileData } = profile;
    await client.machineConnectivityProfile.create({
      data: { ...profileData, tags: { create: tags } },
    });
  }
}
