import { ReactNode } from 'react';

interface AuthLayoutProps {
  children: ReactNode;
  wide?: boolean;
}

export function AuthLayout({ children, wide = false }: AuthLayoutProps) {
  return (
    <main className="relative isolate flex min-h-screen items-center justify-center overflow-hidden bg-[#fbfaff] px-4 py-8 text-slate-900 sm:px-6 lg:py-10">
      <div aria-hidden="true" className="pointer-events-none absolute -left-28 -top-28 -z-10 h-80 w-80 rounded-full bg-violet-200/50 blur-3xl" />
      <div aria-hidden="true" className="pointer-events-none absolute -bottom-36 -right-20 -z-10 h-96 w-96 rounded-full bg-cyan-100/70 blur-3xl" />
      <div className={wide ? 'relative z-10 w-full max-w-6xl' : 'relative z-10 w-full max-w-md'}>
        {children}
      </div>
    </main>
  );
}
