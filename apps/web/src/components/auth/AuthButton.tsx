import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface AuthButtonProps {
  children: ReactNode;
  onClick?: () => void;
  type?: 'button' | 'submit';
  disabled?: boolean;
  loading?: boolean;
  loadingText?: string;
  className?: string;
  icon?: ReactNode;
}

export function AuthButton({
  children,
  onClick,
  type = 'submit',
  disabled = false,
  loading = false,
  loadingText = 'Loading...',
  className,
  icon,
}: AuthButtonProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={cn(
        'flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 font-semibold text-white',
        'shadow-sm shadow-emerald-900/10 transition-colors duration-200 hover:bg-emerald-700',
        'focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-500/25 focus-visible:ring-offset-2',
        'disabled:cursor-not-allowed disabled:opacity-60',
        className
      )}
    >
      {loading ? (
        <>
          <svg className="h-4 w-4 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" aria-hidden="true">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l2.647-2.709z" />
          </svg>
          <span>{loadingText}</span>
        </>
      ) : (
        <>
          <span>{children}</span>
          {icon && <span aria-hidden="true">{icon}</span>}
        </>
      )}
    </button>
  );
}
