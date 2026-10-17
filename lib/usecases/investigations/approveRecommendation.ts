import { prisma } from '@/lib/prisma';
import * as investigationRepository from '@/lib/repositories/investigationRepository';
import * as recommendedActionRepository from '@/lib/repositories/recommendedActionRepository';
import * as alertRepository from '@/lib/repositories/alertRepository';
import * as actionTaskRepository from '@/lib/repositories/actionTaskRepository';
import * as notificationRepository from '@/lib/repositories/notificationRepository';
import * as incidentEventRepository from '@/lib/repositories/incidentEventRepository';
import { createActionTaskRow } from '@/lib/usecases/actionTasks/createActionTaskRow';
import { NotFoundError } from '@/lib/usecases/errors';

export async function approveRecommendation(investigationId: string, recommendationId: string) {
  const investigation = await investigationRepository.findById(investigationId);
  if (!investigation) {
    throw new NotFoundError('Investigation not found');
  }

  const recommendation = await recommendedActionRepository.findById(recommendationId);
  if (!recommendation || recommendation.investigationId !== investigationId) {
    throw new NotFoundError('Recommendation not found');
  }

  const alert = await alertRepository.findById(investigation.alertId);
  if (!alert) {
    throw new NotFoundError('Alert not found');
  }

  return prisma.$transaction(async (tx) => {
    const updatedRecommendation = await recommendedActionRepository.updateStatus(
      recommendationId,
      'Approved',
      tx,
    );

    await investigationRepository.updateStatus(investigationId, 'Investigating', tx);
    await alertRepository.updateStatus(investigation.alertId, 'In Progress', {}, tx);

    await incidentEventRepository.create(
      {
        alertId: investigation.alertId,
        eventType: 'RecommendationApproved',
        fromStatus: alert.status,
        toStatus: 'In Progress',
        message: `Recommendation "${recommendation.title}" approved and dispatched to ${recommendation.owner}.`,
      },
      tx,
    );

    const existingTask = await actionTaskRepository.findByInvestigationAndRecommendation(
      investigationId,
      recommendationId,
      tx,
    );

    const actionTask = existingTask
      ? await actionTaskRepository.update(existingTask.id, { status: 'Assigned' }, tx)
      : await createActionTaskRow(
          investigation,
          recommendation,
          'Carlos Ruiz',
          'Today (Within 1 hour)',
          tx,
        );

    await notificationRepository.create(
      {
        title: 'Action Approved by Operations Manager',
        message: `Recommendation "${recommendation.title}" approved and dispatched to ${recommendation.owner}.`,
        severity: 'High',
        category: 'Production',
        linkModule: 'actions',
      },
      tx,
    );

    return { recommendation: updatedRecommendation, actionTask };
  });
}
