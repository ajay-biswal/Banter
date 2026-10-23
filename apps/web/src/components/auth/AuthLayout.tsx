import { ReactNode } from 'react';

interface AuthLayoutProps {
  children: ReactNode;
}

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <main className="relative isolate flex min-h-screen items-center justify-center overflow-hidden bg-[#f6fbf8] px-4 py-10 text-slate-900 sm:px-6">
      {/* Quiet, decorative shapes add warmth without competing with the form. */}
      <div aria-hidden="true" className="pointer-events-none absolute -left-28 -top-28 -z-10 h-80 w-80 rounded-full bg-emerald-100/80 blur-3xl" />
      <div aria-hidden="true" className="pointer-events-none absolute -bottom-36 -right-20 -z-10 h-96 w-96 rounded-full bg-teal-100/70 blur-3xl" />
      <div aria-hidden="true" className="pointer-events-none absolute right-[12%] top-[15%] -z-10 h-16 w-16 rounded-[1.5rem] rotate-12 border border-emerald-200/70" />
      <div className="relative z-10 w-full max-w-md">
        {children}
      </div>
    </main>
  );
}
