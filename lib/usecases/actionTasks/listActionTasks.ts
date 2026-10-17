import * as actionTaskRepository from '@/lib/repositories/actionTaskRepository';

export async function listActionTasks() {
  return actionTaskRepository.findAll();
}
