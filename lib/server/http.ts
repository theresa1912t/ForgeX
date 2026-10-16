import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import * as userRepository from '@/lib/repositories/userRepository';
import { NotFoundError, ValidationError } from '@/lib/usecases/errors';
import type { UserRole } from '@/lib/types';

export function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

type RouteHandler<Args extends unknown[]> = (...args: Args) => Promise<NextResponse>;

// allowedRoles omitted => any authenticated session passes (most routes). When provided, role
// is looked up from the DB rather than the session — the session JWT deliberately doesn't carry
// role (see auth.ts), so a role change takes effect on the next request, not just next login.
export function withAuth<Args extends unknown[]>(
  handler: RouteHandler<Args>,
  allowedRoles?: UserRole[],
): RouteHandler<Args> {
  return async (...args: Args) => {
    const session = await auth();
    if (!session?.user) {
      return jsonError('Unauthorized', 401);
    }

    if (allowedRoles) {
      const user = await userRepository.findById(session.user.id);
      if (!user || !allowedRoles.includes(user.role)) {
        return jsonError("You don't have permission to perform this action.", 403);
      }
    }

    return handler(...args);
  };
}

export function withErrorHandling<Args extends unknown[]>(
  handler: RouteHandler<Args>,
): RouteHandler<Args> {
  return async (...args: Args) => {
    try {
      return await handler(...args);
    } catch (error: unknown) {
      if (error instanceof NotFoundError) {
        return jsonError(error.message, 404);
      }
      if (error instanceof ValidationError) {
        return jsonError(error.message, 400);
      }
      console.error(error);
      return jsonError(error instanceof Error ? error.message : 'Internal Server Error', 500);
    }
  };
}
