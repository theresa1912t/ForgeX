import * as investigationRepository from '@/lib/repositories/investigationRepository';
import { NotFoundError } from '@/lib/usecases/errors';

export async function getInvestigation(id: string) {
  const investigation = await investigationRepository.findById(id);
  if (!investigation) {
    throw new NotFoundError('Investigation not found');
  }
  return investigation;
}
