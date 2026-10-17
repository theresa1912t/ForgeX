'use client';

import React, { useState } from 'react';
import { signIn } from 'next-auth/react';
import { Sparkles, Shield, UserCheck, ArrowRight, Lock, Mail } from 'lucide-react';

const DEMO_PERSONAS = [
  {
    name: 'Marcus Vance',
    role: 'Plant Operations Manager',
    email: 'marcus.vance@lactapuredairy.com',
    password: 'ForgeX-Demo-2026!',
    badge: 'Operations Lead',
  },
  {
    name: 'Elena Rostova',
    role: 'VP of Dairy Manufacturing',
    email: 'elena.rostova@lactapuredairy.com',
    password: 'ForgeX-Demo-2026!',
    badge: 'Admin & OpEx',
  },
  {
    name: 'Carlos Ruiz',
    role: 'Reliability & Maintenance Lead',
    email: 'carlos.ruiz@lactapuredairy.com',
    password: 'ForgeX-Demo-2026!',
    badge: 'Maintenance',
  },
];

export default function LoginPage() {
  const [email, setEmail] = useState('marcus.vance@lactapuredairy.com');
  const [password, setPassword] = useState('ForgeX-Demo-2026!');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e?: React.FormEvent, customEmail?: string, customPassword?: string) => {
    if (e) e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const submitEmail = customEmail || email;
    const submitPassword = customPassword || password;

    try {
      const result = await signIn('credentials', {
        email: submitEmail,
        password: submitPassword,
        redirect: false,
      });

      setIsSubmitting(false);

      if (result?.error) {
        setError('Authentication failed. Click "Sign in as Marcus Vance" below to bypass.');
        return;
      }

      window.location.assign('/');
    } catch {
      setIsSubmitting(false);
      setError('Connection error. Please try the 1-click persona sign-in below.');
    }
  };

  const handleSelectPersona = (persona: typeof DEMO_PERSONAS[0]) => {
    setEmail(persona.email);
    setPassword(persona.password);
    handleSubmit(undefined, persona.email, persona.password);
  };

  return (
    <div className="flex min-h-screen bg-slate-50 items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
        
        {/* Brand Header */}
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold tracking-tight text-slate-900">FactoryLens</span>
              <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                Demo
              </span>
            </div>
            <p className="text-[13px] text-slate-500 mt-1">
              AI Production Loss &amp; Operations Copilot
            </p>
          </div>
          <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100 shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
        </div>

        {/* 1-Click Quick Demo Sign-in */}
        <div className="mb-6 space-y-2">
          <div className="flex items-center justify-between text-[12px] font-semibold text-slate-700 mb-1">
            <span>Select Demo Persona (1-Click Login):</span>
            <span className="text-slate-400 font-normal">Pre-authorized</span>
          </div>

          <div className="space-y-1.5">
            {DEMO_PERSONAS.map((p) => (
              <button
                key={p.email}
                type="button"
                onClick={() => handleSelectPersona(p)}
                disabled={isSubmitting}
                className="w-full p-2.5 rounded-lg border border-slate-200 hover:border-blue-300 hover:bg-blue-50/50 bg-slate-50/70 transition-all text-left flex items-center justify-between group cursor-pointer disabled:opacity-60"
              >
                <div>
                  <div className="text-[13px] font-semibold text-slate-900 flex items-center gap-1.5">
                    <span>{p.name}</span>
                    <span className="text-[10px] px-1.5 py-0.2 bg-white text-slate-600 rounded border border-slate-200 font-normal">
                      {p.badge}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500">{p.role}</div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all" />
              </button>
            ))}
          </div>
        </div>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-200" />
          </div>
          <div className="relative flex justify-center text-[11px] uppercase">
            <span className="bg-white px-3 text-slate-400 font-medium tracking-wider">
              Or Sign In with Credentials
            </span>
          </div>
        </div>

        {/* Credentials Form */}
        <form onSubmit={(e) => handleSubmit(e)} className="flex flex-col gap-4">
          <div>
            <label htmlFor="email" className="block text-[12px] font-medium text-slate-700 mb-1">
              Email Address
            </label>
            <div className="relative">
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full h-10 pl-9 pr-3 text-[13px] bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white transition-colors"
                autoComplete="email"
              />
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label htmlFor="password" className="block text-[12px] font-medium text-slate-700">
                Password
              </label>
              <span className="text-[11px] text-slate-400 font-mono">Demo: ForgeX-Demo-2026!</span>
            </div>
            <div className="relative">
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full h-10 pl-9 pr-3 text-[13px] bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-blue-600 focus:bg-white transition-colors font-mono"
                autoComplete="current-password"
              />
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            </div>
          </div>

          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-[12px] text-rose-700">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="h-10 mt-2 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-medium text-[13px] transition-colors flex items-center justify-center gap-2 shadow-xs cursor-pointer"
          >
            {isSubmitting ? (
              <span>Signing in...</span>
            ) : (
              <>
                <UserCheck className="w-4 h-4" />
                <span>Sign In to Plant Dashboard</span>
              </>
            )}
          </button>
        </form>

        <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-center gap-2 text-[11px] text-slate-400">
          <Shield className="w-3.5 h-3.5" />
          <span>Role-Based Access Control · ISO 27001 Certified</span>
        </div>
      </div>
    </div>
  );
}
