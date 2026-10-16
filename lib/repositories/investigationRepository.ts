import type { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { rootCauseStatusReverseMap, recommendationStatusReverseMap } from '@/prisma/enumMaps';
import type { Investigation } from '@/lib/types';
import type { DbClient } from './types';

const include = {
  rootCauses: { orderBy: { rank: 'asc' } },
  evidence: true,
  businessImpact: true,
  recommendations: true,
} satisfies Prisma.InvestigationInclude;

type InvestigationWithRelations = Prisma.InvestigationGetPayload<{ include: typeof include }>;

function serialize(investigation: InvestigationWithRelations) {
  const { businessImpact, ...rest } = investigation;
  return {
    ...rest,
    rootCauses: investigation.rootCauses.map((rc) => ({
      ...rc,
      status: rootCauseStatusReverseMap[rc.status],
    })),
    recommendations: investigation.recommendations.map((rec) => ({
      ...rec,
      status: recommendationStatusReverseMap[rec.status],
    })),
    businessImpact: businessImpact ?? undefined,
  };
}

export async function findAll(client: DbClient = prisma) {
  const rows = await client.investigation.findMany({ include });
  return rows.map(serialize);
}

export async function findById(id: string, client: DbClient = prisma) {
  const row = await client.investigation.findUnique({ where: { id }, include });
  return row ? serialize(row) : null;
}

export async function updateStatus(
  id: string,
  status: Investigation['status'],
  client: DbClient = prisma,
) {
  return client.investigation.update({ where: { id }, data: { status } });
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
  return client.investigation.update({
    where: { id },
    data: {
      status: data.status,
      resolvedAt: data.resolvedAt,
      resolutionOutcome: data.resolutionOutcome as unknown as Prisma.InputJsonValue,
    },
  });
}

// Bulk reset/seed path: rows are already Prisma-shaped (built by prisma/seedData.ts).
export async function deleteAll(client: DbClient = prisma) {
  return client.investigation.deleteMany({});
}

// Creates the investigation and its no-independent-lifecycle children (RootCause/EvidenceItem/
// BusinessImpact). RecommendedAction is created separately via recommendedActionRepository,
// since it has its own repository/lifecycle.
export async function createWithChildren(
  parts: {
    investigation: Prisma.InvestigationUncheckedCreateInput;
    rootCauses: Prisma.RootCauseCreateManyInput[];
    evidence: Prisma.EvidenceItemCreateManyInput[];
    businessImpact: Prisma.BusinessImpactCreateManyInput;
  },
  client: DbClient = prisma,
) {
  await client.investigation.create({ data: parts.investigation });
  await client.rootCause.createMany({ data: parts.rootCauses });
  await client.evidenceItem.createMany({ data: parts.evidence });
  await client.businessImpact.create({ data: parts.businessImpact });
}

// Deletes only the children with no independent lifecycle (RootCause/EvidenceItem/
// BusinessImpact). RecommendedAction has its own repository/lifecycle and must be deleted
// separately (before this, since it also FKs into Investigation).
export async function deleteAllChildren(client: DbClient = prisma) {
  await client.businessImpact.deleteMany({});
  await client.evidenceItem.deleteMany({});
  await client.rootCause.deleteMany({});
}
