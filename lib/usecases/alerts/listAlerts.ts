import * as alertRepository from '@/lib/repositories/alertRepository';

export async function listAlerts() {
  return alertRepository.findAll();
}
