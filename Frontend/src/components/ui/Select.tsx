import { forwardRef, type SelectHTMLAttributes } from 'react';
import { ChevronDown } from 'lucide-react';

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  hint?: string;
  error?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, hint, error, className = '', id, children, ...props }, ref) => {
    const selectId = id || props.name;
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={selectId} className="text-[13px] font-medium text-ink-700">
            {label}
          </label>
        )}
        <div className="relative">
          <select
            ref={ref}
            id={selectId}
            className={`w-full h-10 pl-3.5 pr-10 text-[14px] text-ink-900 bg-white border border-ink-200 rounded-xl transition-colors hover:border-ink-400 focus:border-ink-900 focus:ring-2 focus:ring-ink-900/5 appearance-none cursor-pointer ${error ? 'border-error' : ''} ${className}`}
            {...props}
          >
            {children}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-500 pointer-events-none" />
        </div>
        {error ? (
          <p className="text-[12px] text-error">{error}</p>
        ) : hint ? (
          <p className="text-[12px] text-ink-500">{hint}</p>
        ) : null}
      </div>
    );
  }
);

Select.displayName = 'Select';
