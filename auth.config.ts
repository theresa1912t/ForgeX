import type { NextAuthConfig } from 'next-auth';

// Edge-safe base config (no providers that touch Prisma/bcrypt) — used by middleware.ts.
// The full config with the Credentials provider lives in auth.ts (Node runtime only).
export default {
  pages: {
    signIn: '/login',
  },
  // Lets NextAuth accept requests whose Host header isn't localhost/the configured AUTH_URL —
  // needed to run behind a tunnel (ngrok, Cloudflare Tunnel) for a demo; otherwise login fails
  // with an UntrustedHost error on the tunnel's domain.
  trustHost: true,
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
