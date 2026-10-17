import * as thresholdsRepository from '@/lib/repositories/thresholdsRepository';
import { NotFoundError } from '@/lib/usecases/errors';
import type { OperationalThresholds } from '@/lib/types';

const FIELDS = [
  'productionVariancePct',
  'defectRateThresholdPct',
  'vibrationAnomalyMmS',
  'downtimeAlertMinutes',
  'wasteThresholdKg',
  'energyAnomalyPct',
] as const;

export async function updateThresholds(input: Record<string, unknown>) {
  const data: Partial<OperationalThresholds> = {};
  for (const field of FIELDS) {
    if (input[field] !== undefined) {
      data[field] = Number(input[field]);
    }
  }

  const thresholds = await thresholdsRepository.update(data);
  if (!thresholds) {
    throw new NotFoundError('Thresholds not configured');
  }
  return thresholds;
}
