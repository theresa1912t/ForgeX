import type { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { rootCauseStatusReverseMap, recommendationStatusReverseMap } from '@/prisma/enumMaps';
import { heroInvestigation } from '@/lib/mockData';
import { safeDb } from './safeDb';
import type { Investigation } from '@/lib/types';
import type { DbClient } from './types';

const include = {
  rootCauses: { orderBy: { rank: 'asc' } },
  evidence: true,
  businessImpact: true,
  recommendations: true,
} satisfies Prisma.InvestigationInclude;

type InvestigationWithRelations = Prisma.InvestigationGetPayload<{ include: typeof include }>;

function serialize(investigation: InvestigationWithRelations): Investigation {
  const { businessImpact, rootCauses, evidence, recommendations, timeline, sensorDeltas, resolvedAt, resolutionOutcome, ...rest } =
    investigation;
  return {
    ...rest,
    timeline: timeline as unknown as Investigation['timeline'],
    sensorDeltas: sensorDeltas as unknown as Investigation['sensorDeltas'],
    resolvedAt: resolvedAt ?? undefined,
    resolutionOutcome: (resolutionOutcome as unknown as Investigation['resolutionOutcome']) ?? undefined,
    rootCauses: rootCauses.map(({ investigationId, ...rc }) => ({
      ...rc,
      status: rootCauseStatusReverseMap[rc.status],
    })),
    evidence: evidence.map(({ investigationId, ...ev }) => ev),
    recommendations: recommendations.map((rec) => ({
      ...rec,
      status: recommendationStatusReverseMap[rec.status],
    })),
    businessImpact: businessImpact
      ? (() => {
          const { id, investigationId, ...impact } = businessImpact;
          return impact;
        })()
      : undefined,
  } as Investigation;
}

export async function findAll(client: DbClient = prisma) {
  return safeDb(
    async () => {
      const rows = await client.investigation.findMany({ include, orderBy: { id: 'asc' } });
      return rows.map(serialize);
    },
    [heroInvestigation]
  );
}

export async function findById(id: string, client: DbClient = prisma) {
  return safeDb(
    async () => {
      const row = await client.investigation.findUnique({ where: { id }, include });
      return row ? serialize(row) : null;
    },
    () => heroInvestigation.id === id ? heroInvestigation : null
  );
}

export async function updateStatus(
  id: string,
  status: Investigation['status'],
  client: DbClient = prisma,
) {
  return safeDb(
    async () => {
      await client.investigation.update({ where: { id }, data: { status } });
    },
    undefined
  );
}

export async function updateResolution(
  id: string,
  data: {
    status: Investigation['status'];
    resolvedAt: string;
    resolutionOutcome: Investigation['resolutionOutcome'];
  },
  client: DbClient = prisma,
) {
  return safeDb(
    async () => {
      await client.investigation.update({
        where: { id },
        data: {
          status: data.status,
          resolvedAt: data.resolvedAt,
          resolutionOutcome: data.resolutionOutcome as unknown as Prisma.InputJsonValue,
        },
      });
    },
    undefined
  );
}

export async function deleteAll(client: DbClient = prisma) {
  return safeDb(() => client.investigation.deleteMany({}), { count: 0 });
}

export async function createWithChildren(
  parts: {
    investigation: Prisma.InvestigationUncheckedCreateInput;
    rootCauses: Prisma.RootCauseCreateManyInput[];
    evidence: Prisma.EvidenceItemCreateManyInput[];
    businessImpact: Prisma.BusinessImpactCreateManyInput;
  },
  client: DbClient = prisma,
) {
  return safeDb(async () => {
    await client.investigation.create({ data: parts.investigation });
    await client.rootCause.createMany({ data: parts.rootCauses });
    await client.evidenceItem.createMany({ data: parts.evidence });
    await client.businessImpact.create({ data: parts.businessImpact });
  }, undefined);
}

export async function deleteAllChildren(client: DbClient = prisma) {
  return safeDb(async () => {
    await client.businessImpact.deleteMany({});
    await client.evidenceItem.deleteMany({});
    await client.rootCause.deleteMany({});
  }, undefined);
}
