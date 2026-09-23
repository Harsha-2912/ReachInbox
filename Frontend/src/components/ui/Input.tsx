import { forwardRef, type InputHTMLAttributes, type TextareaHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  hint?: string;
  error?: string;
  icon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, hint, error, icon, className = '', id, ...props }, ref) => {
    const inputId = id || props.name;
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={inputId} className="text-[13px] font-medium text-ink-700">
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-500 pointer-events-none">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            id={inputId}
            className={`w-full h-10 px-3.5 text-[14px] text-ink-900 bg-white border border-ink-200 rounded-xl transition-colors placeholder:text-ink-500 hover:border-ink-400 focus:border-ink-900 focus:ring-2 focus:ring-ink-900/5 ${icon ? 'pl-10' : ''} ${error ? 'border-error focus:border-error focus:ring-error/5' : ''} ${className}`}
            {...props}
          />
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

Input.displayName = 'Input';

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  hint?: string;
  error?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, hint, error, className = '', id, ...props }, ref) => {
    const textareaId = id || props.name;
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={textareaId} className="text-[13px] font-medium text-ink-700">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={textareaId}
          className={`w-full px-3.5 py-2.5 text-[14px] text-ink-900 bg-white border border-ink-200 rounded-xl transition-colors placeholder:text-ink-500 hover:border-ink-400 focus:border-ink-900 focus:ring-2 focus:ring-ink-900/5 resize-y min-h-[120px] ${error ? 'border-error' : ''} ${className}`}
          {...props}
        />
        {error ? (
          <p className="text-[12px] text-error">{error}</p>
        ) : hint ? (
          <p className="text-[12px] text-ink-500">{hint}</p>
        ) : null}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';
