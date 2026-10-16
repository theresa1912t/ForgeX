import * as actionTaskRepository from '@/lib/repositories/actionTaskRepository';
import type { DbClient } from '@/lib/repositories/types';
import type { Investigation, RecommendedAction } from '@/lib/types';

// Shared by approveRecommendation and createActionTaskFromRecommendation: both need to spin up
// a new ActionTask from a RecommendedAction using the same field-building rules.
export async function createActionTaskRow(
  investigation: Pick<Investigation, 'id' | 'alertId' | 'lineName' | 'machineName'>,
  recommendation: Pick<
    RecommendedAction,
    'id' | 'title' | 'reason' | 'evidence' | 'priority' | 'owner' | 'expectedImpact'
  >,
  assignedTo: string | undefined,
  dueDate: string | undefined,
  client?: DbClient,
) {
  return actionTaskRepository.create(
    {
      title: recommendation.title,
      description: `${recommendation.reason} Evidence: ${recommendation.evidence}`,
      investigationId: investigation.id,
      alertId: investigation.alertId,
      recommendationId: recommendation.id,
      lineName: investigation.lineName,
      machineName: investigation.machineName,
      priority: recommendation.priority,
      assignedTo: assignedTo || 'Carlos Ruiz',
      assignedRole: recommendation.owner === 'Maintenance' ? 'Maintenance Lead' : 'QA Lead',
      dueDate: dueDate || 'Today',
      expectedImpact: recommendation.expectedImpact,
      status: 'Assigned',
    },
    client,
  );
}
