import * as productRepository from '@/lib/repositories/productRepository';

export async function listProducts() {
  return productRepository.findAll();
}
