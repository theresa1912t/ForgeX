import * as actionTaskRepository from '@/lib/repositories/actionTaskRepository';
import { NotFoundError } from '@/lib/usecases/errors';
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

  return actionTaskRepository.update(id, { status: data.status });
}
