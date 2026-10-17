import * as actionTaskRepository from '@/lib/repositories/actionTaskRepository';
import { NotFoundError } from '@/lib/usecases/errors';
import { ACTION_TASK_TRANSITIONS, assertValidTransition } from '@/lib/domain/statusTransitions';
import type { ActionTask } from '@/lib/types';

// Mirrors factoryStore.tsx: assignTask always forces status to 'Assigned', independent of
// updateTaskStatus's plain status update.
export async function updateActionTask(
  id: string,
  data: { status?: ActionTask['status']; assignedTo?: string; assignedRole?: string },
) {
  const existing = await actionTaskRepository.findById(id);
  if (!existing) {
    throw new NotFoundError('Action task not found');
  }

  if (data.assignedTo !== undefined) {
    return actionTaskRepository.update(id, {
      assignedTo: data.assignedTo,
      assignedRole: data.assignedRole,
      status: 'Assigned',
    });
  }

  // need-checking.md §5/§11: reject any status value the client sends that isn't a legal next
  // step from the task's current status — this was previously unvalidated.
  if (data.status) {
    assertValidTransition(
      ACTION_TASK_TRANSITIONS,
      existing.status as ActionTask['status'],
      data.status,
      'action task status',
    );
  }

  return actionTaskRepository.update(id, { status: data.status });
}
