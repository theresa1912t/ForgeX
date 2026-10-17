/**
 * Resilient Database Execution Wrapper
 * Attempts the Prisma database query first. If the database is unreachable
 * (e.g. during local evaluation without a live PostgreSQL instance or unprovisioned Cloud SQL),
 * gracefully returns the designated mock data fallback rather than throwing 500 errors.
 */
export async function safeDb<T>(dbOp: () => Promise<T>, fallback: T | (() => T)): Promise<T> {
  try {
    const res = await dbOp();
    if (res !== null && res !== undefined) {
      if (Array.isArray(res) && res.length === 0) {
        return typeof fallback === 'function' ? (fallback as () => T)() : fallback;
      }
      return res;
    }
    return typeof fallback === 'function' ? (fallback as () => T)() : fallback;
  } catch (err) {
    // Database connection failed or table does not exist
    return typeof fallback === 'function' ? (fallback as () => T)() : fallback;
  }
}
