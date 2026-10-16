import NextAuth from 'next-auth';
import authConfig from './auth.config';

export const { auth: middleware } = NextAuth(authConfig);

// Protects every page except /login, next-auth's own routes, and static assets. API routes
// under /api/v1 are protected separately (lib/server/http.ts's withAuth), not here, since that
// needs the full Node-runtime auth() with Prisma — this middleware only runs the edge-safe
// authConfig (no Credentials provider) to decide page-navigation redirects.
export const config = {
  matcher: ['/((?!api|login|_next/static|_next/image|favicon.ico).*)'],
};
