'use client';

import React, { useState } from 'react';
import { signIn } from 'next-auth/react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const result = await signIn('credentials', {
      email,
      password,
      redirect: false,
    });

    setIsSubmitting(false);

    if (result?.error) {
      setError('Invalid email or password.');
      return;
    }

    window.location.href = '/';
  };

  return (
    <div className="flex min-h-screen bg-[#F7F8FA] items-center justify-center px-4">
      <div className="w-full max-w-sm bg-white rounded-xl border border-[#E4E7EB] p-8 shadow-xs">
        <h1 className="text-[18px] font-semibold text-[#18202A] mb-1">FactoryLens</h1>
        <p className="text-[13px] text-[#5F6875] mb-6">Sign in to continue</p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label htmlFor="email" className="block text-[13px] font-medium text-[#18202A] mb-1.5">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full h-10 px-3 text-[14px] bg-[#F7F8FA] border border-[#E4E7EB] rounded-lg text-[#18202A] focus:outline-none focus:border-[#2F5BFF] focus:bg-white transition-colors"
              autoComplete="email"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-[13px] font-medium text-[#18202A] mb-1.5">
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full h-10 px-3 text-[14px] bg-[#F7F8FA] border border-[#E4E7EB] rounded-lg text-[#18202A] focus:outline-none focus:border-[#2F5BFF] focus:bg-white transition-colors"
              autoComplete="current-password"
            />
          </div>

          {error && <p className="text-[13px] text-[#D92D20]">{error}</p>}

          <button
            type="submit"
            disabled={isSubmitting}
            className="h-10 mt-1 rounded-lg bg-[#2F5BFF] hover:bg-[#2448D8] disabled:opacity-60 text-white font-medium text-[14px] transition-colors"
          >
            {isSubmitting ? 'Signing in...' : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  );
}
