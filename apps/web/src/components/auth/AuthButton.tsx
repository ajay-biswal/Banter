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
        'w-full h-11 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600',
        'text-white font-medium',
        'hover:opacity-90 hover:shadow-lg hover:shadow-purple-500/25',
        'transition-all duration-200',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        'flex items-center justify-center gap-2',
        className
      )}
    >
      {loading ? (
        <>
          <svg 
            className="animate-spin h-4 w-4" 
            xmlns="http://www.w3.org/2000/svg" 
            fill="none" 
            viewBox="0 0 24 24"
          >
            <circle 
              className="opacity-25" 
              cx="12" 
              cy="12" 
              r="10" 
              stroke="currentColor" 
              strokeWidth="4"
            />
            <path 
              className="opacity-75" 
              fill="currentColor" 
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          {loadingText}
        </>
      ) : (
        <>
          {children}
          {icon && <span className="ml-1">{icon}</span>}
        </>
      )}
    </button>
  );
}
