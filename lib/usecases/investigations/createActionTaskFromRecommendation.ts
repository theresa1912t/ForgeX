import { prisma } from '@/lib/prisma';
import * as investigationRepository from '@/lib/repositories/investigationRepository';
import * as recommendedActionRepository from '@/lib/repositories/recommendedActionRepository';
import * as incidentEventRepository from '@/lib/repositories/incidentEventRepository';
import { createActionTaskRow } from '@/lib/usecases/actionTasks/createActionTaskRow';
import { NotFoundError, ValidationError } from '@/lib/usecases/errors';

export async function createActionTaskFromRecommendation(
  investigationId: string,
  recommendationId: string,
  assignedTo: string | undefined,
  dueDate: string | undefined,
) {
  if (!recommendationId) {
    throw new ValidationError('recommendationId is required');
  }

  const investigation = await investigationRepository.findById(investigationId);
  if (!investigation) {
    throw new NotFoundError('Investigation not found');
  }

  const recommendation = await recommendedActionRepository.findById(recommendationId);
  if (!recommendation || recommendation.investigationId !== investigationId) {
    throw new NotFoundError('Recommendation not found');
  }

  return prisma.$transaction(async (tx) => {
    const task = await createActionTaskRow(investigation, recommendation, assignedTo, dueDate, tx);
    await recommendedActionRepository.updateStatus(recommendationId, 'Task Created', tx);

    await incidentEventRepository.create(
      {
        alertId: investigation.alertId,
        eventType: 'TaskDispatched',
        actorName: assignedTo ?? null,
        message: `Work order "${recommendation.title}" dispatched${assignedTo ? ` to ${assignedTo}` : ''}.`,
      },
      tx,
    );

    return task;
  });
}
