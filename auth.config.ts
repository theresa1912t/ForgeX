import type { NextAuthConfig } from 'next-auth';

// Edge-safe base config (no providers that touch Prisma/bcrypt) — used by middleware.ts.
// The full config with the Credentials provider lives in auth.ts (Node runtime only).
export default {
  secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET || 'zwPRRYIxPdHMaiGachYj1fWdKX3YzZsE4M8E0w/9hps=',
  pages: {
    signIn: '/login',
  },
  providers: [],
  callbacks: {
    authorized({ auth, request }) {
      const isLoggedIn = Boolean(auth?.user);
      const isLoginPage = request.nextUrl.pathname === '/login';

      if (isLoginPage) {
        return true;
      }

      return isLoggedIn;
    },
  },
} satisfies NextAuthConfig;
