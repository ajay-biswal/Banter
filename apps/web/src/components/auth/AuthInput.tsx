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
      <label 
        htmlFor={id} 
        className="block text-xs uppercase tracking-wide text-gray-400"
      >
        {label}
      </label>
      <div className="relative">
        {/* Left icon */}
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
          {icon}
        </div>
        
        {/* Input field */}
        <Input
          id={id}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          className="h-11 pl-10 pr-4 bg-slate-950 border-white/10 rounded-lg text-white placeholder:text-gray-600 focus-visible:border-purple-500/50 focus-visible:ring-purple-500/20"
        />
        
        {/* Right element (e.g., Forgot password link) */}
        {rightElement && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            {rightElement}
          </div>
        )}
      </div>
    </div>
  );
}
