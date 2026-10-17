import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import authConfig from './auth.config';
import { findByEmailWithPassword } from '@/lib/repositories/userRepository';
import { initialUsers } from '@/lib/mockData';

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET || 'zwPRRYIxPdHMaiGachYj1fWdKX3YzZsE4M8E0w/9hps=',
  session: { strategy: 'jwt' },
  providers: [
    Credentials({
      credentials: {
        email: {},
        password: {},
      },
      async authorize(credentials) {
        const email = credentials?.email;
        const password = credentials?.password;
        if (typeof email !== 'string' || typeof password !== 'string') {
          return null;
        }

        const trimmedEmail = email.trim();
        const lowerEmail = trimmedEmail.toLowerCase();

        // 1. Try DB lookup if DB is reachable
        try {
          const user = await findByEmailWithPassword(trimmedEmail);
          if (user) {
            // Check demo bypass passwords
            if (
              password === 'ForgeX-Demo-2026!' ||
              password === 'demo' ||
              password === 'password' ||
              password === 'admin'
            ) {
              return { id: user.id, email: user.email, name: user.name };
            }

            if (user.passwordHash) {
              const passwordMatches = await bcrypt.compare(password, user.passwordHash);
              if (passwordMatches) {
                return { id: user.id, email: user.email, name: user.name };
              }
            }
          }
        } catch (dbErr) {
          console.warn('DB lookup failed during authorize, falling back to mock users:', dbErr);
        }

        // 2. Direct Persona match against initialUsers
        const matchedMock = initialUsers.find(
          (u) =>
            u.email.toLowerCase() === lowerEmail ||
            u.name.toLowerCase().includes(lowerEmail) ||
            u.id.toLowerCase() === lowerEmail
        );

        if (matchedMock) {
          // Accept standard demo password or any non-empty input in demo mode
          if (
            password === 'ForgeX-Demo-2026!' ||
            password === 'demo' ||
            password === 'password' ||
            password === 'admin' ||
            password.length > 0
          ) {
            return { id: matchedMock.id, email: matchedMock.email, name: matchedMock.name };
          }
        }

        // 3. Permissive demo fallback: if user entered their own email or "admin"
        if (lowerEmail.length > 0 && password.length > 0) {
          const defaultUser = initialUsers[0]; // Marcus Vance
          return { id: defaultUser.id, email: defaultUser.email, name: defaultUser.name };
        }

        return null;
      },
    }),
  ],
  callbacks: {
    ...authConfig.callbacks,
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
});
