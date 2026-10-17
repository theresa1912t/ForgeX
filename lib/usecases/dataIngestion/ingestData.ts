import * as notificationRepository from '@/lib/repositories/notificationRepository';
import { ValidationError } from '@/lib/usecases/errors';

// Simulated ingestion: no real CSV parsing yet (see PLANNING.md phase 7). Mirrors
// factoryStore.tsx's `ingestData`, which only records a notification for the demo.
export async function ingestData(datasetType: string, count: number, summaryNotes?: string) {
  if (!datasetType || typeof count !== 'number') {
    throw new ValidationError('datasetType and count are required');
  }

  return notificationRepository.create({
    title: `CSV Ingestion Completed: ${datasetType}`,
    message: `Successfully processed ${count} records. AI cross-domain anomaly checks executed. ${summaryNotes || ''}`,
    severity: 'Low',
    category: 'Production',
    linkModule: 'dashboard',
  });
}
