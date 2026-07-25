import { TextareaHTMLAttributes, forwardRef } from 'react';

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  className?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className = "", ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        className={`w-full rounded-xl border border-[#D1D5DB] p-3 text-sm focus:border-[#003366] focus:ring-1 focus:ring-[#003366] outline-none resize-none ${className}`}
        {...props}
      />
    );
  }
);

Textarea.displayName = "Textarea";