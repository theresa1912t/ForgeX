import * as ingredientUsageRecordRepository from '@/lib/repositories/ingredientUsageRecordRepository';

export async function listIngredientUsageRecords() {
  return ingredientUsageRecordRepository.findAll();
}
