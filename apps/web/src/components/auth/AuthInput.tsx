import { ReactNode } from 'react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface AuthInputProps {
  id: string;
  label: string;
  type?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  icon: ReactNode;
  rightElement?: ReactNode;
  className?: string;
  required?: boolean;
}

export function AuthInput({
  id,
  label,
  type = 'text',
  value,
  onChange,
  placeholder,
  icon,
  rightElement,
  className,
  required = true,
}: AuthInputProps) {
  return (
    <div className={cn('space-y-2', className)}>
      <label htmlFor={id} className="block text-sm font-medium text-slate-700">
        {label}
      </label>
      <div className="relative">
        <div aria-hidden="true" className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
          {icon}
        </div>
        <Input
          id={id}
          name={id}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          autoComplete={id === 'email' ? 'email' : id === 'name' ? 'name' : id === 'password' ? 'current-password' : undefined}
          className={cn(
            'h-12 rounded-xl border-slate-200 bg-white pl-10 text-base text-slate-900 shadow-none placeholder:text-slate-400',
            'focus-visible:border-emerald-500 focus-visible:ring-4 focus-visible:ring-emerald-500/15',
            rightElement ? 'pr-11' : 'pr-4'
          )}
        />
        {rightElement && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            {rightElement}
          </div>
        )}
      </div>
    </div>
  );
}
