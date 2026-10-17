import { prisma } from '@/lib/prisma';
import type { OperationalThresholds } from '@/lib/types';
import type { DbClient } from './types';

const FIELDS = [
  'productionVariancePct',
  'defectRateThresholdPct',
  'vibrationAnomalyMmS',
  'downtimeAlertMinutes',
  'wasteThresholdKg',
  'energyAnomalyPct',
] as const;

function serialize(row: Record<string, unknown>): OperationalThresholds {
  return Object.fromEntries(
    FIELDS.map((field) => [field, row[field]]),
  ) as unknown as OperationalThresholds;
}

export async function find(client: DbClient = prisma) {
  const row = await client.operationalThresholds.findFirst();
  return row ? serialize(row) : null;
}

// Single-tenant: there's exactly one thresholds row (per factory). Looks it up internally so
// callers don't need to know its id.
export async function update(data: Partial<OperationalThresholds>, client: DbClient = prisma) {
  const existing = await client.operationalThresholds.findFirst();
  if (!existing) return null;
  const row = await client.operationalThresholds.update({ where: { id: existing.id }, data });
  return serialize(row);
}
