import { forwardRef, type InputHTMLAttributes } from 'react';
import { Search, X } from 'lucide-react';

interface SearchBarProps extends InputHTMLAttributes<HTMLInputElement> {
  onClear?: () => void;
  containerClassName?: string;
}

export const SearchBar = forwardRef<HTMLInputElement, SearchBarProps>(
  ({ onClear, containerClassName = '', value, className = '', ...props }, ref) => {
    return (
      <div className={`relative ${containerClassName}`}>
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-500 pointer-events-none" />
        <input
          ref={ref}
          type="text"
          value={value}
          className={`w-full h-10 pl-10 pr-9 text-[13px] text-ink-900 bg-white border border-ink-200 rounded-full transition-colors placeholder:text-ink-500 hover:border-ink-400 focus:border-ink-900 focus:ring-2 focus:ring-ink-900/5 ${className}`}
          {...props}
        />
        {value && onClear && (
          <button
            onClick={onClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-500 hover:text-ink-900 transition-colors"
            aria-label="Clear search"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    );
  }
);

SearchBar.displayName = 'SearchBar';
