import { ReactNode } from 'react';

interface AuthCardProps {
  children: ReactNode;
}

export function AuthCard({ children }: AuthCardProps) {
  return (
    <section className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-[0_24px_80px_-36px_rgba(15,23,42,0.22)] sm:p-8">
      {children}
    </section>
  );
}
