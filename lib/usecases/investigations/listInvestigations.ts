import * as investigationRepository from '@/lib/repositories/investigationRepository';

export async function listInvestigations() {
  return investigationRepository.findAll();
}
