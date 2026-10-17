import * as userRepository from '@/lib/repositories/userRepository';

export async function listUsers() {
  return userRepository.findAll();
}
