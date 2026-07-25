import { InputHTMLAttributes, forwardRef } from 'react';

interface CheckboxProps extends InputHTMLAttributes<HTMLInputElement> {
  className?: string;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className = "", ...props }, ref) => {
    return (
      <input
        type="checkbox"
        ref={ref}
        className={`size-4 rounded border border-[#D1D5DB] text-[#003366] focus:ring-[#003366] ${className}`}
        {...props}
      />
    );
  }
);

Checkbox.displayName = "Checkbox";