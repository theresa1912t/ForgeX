import * as thresholdsRepository from '@/lib/repositories/thresholdsRepository';
import { NotFoundError } from '@/lib/usecases/errors';

export async function getThresholds() {
  const thresholds = await thresholdsRepository.find();
  if (!thresholds) {
    throw new NotFoundError('Thresholds not configured');
  }
  return thresholds;
}
