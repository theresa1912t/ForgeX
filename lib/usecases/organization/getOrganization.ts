import * as organizationRepository from '@/lib/repositories/organizationRepository';

export async function getOrganization() {
  return organizationRepository.findFirst();
}
