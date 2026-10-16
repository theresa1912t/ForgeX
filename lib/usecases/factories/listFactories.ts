import * as factoryRepository from '@/lib/repositories/factoryRepository';

export async function listFactories() {
  return factoryRepository.findAll();
}
