import { NextResponse } from 'next/server';
import { NotFoundError, ValidationError } from '@/lib/usecases/errors';

export function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

type RouteHandler<Args extends unknown[]> = (...args: Args) => Promise<NextResponse>;

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
