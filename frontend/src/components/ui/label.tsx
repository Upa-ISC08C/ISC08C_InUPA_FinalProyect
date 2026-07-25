import { LabelHTMLAttributes } from 'react';

interface LabelProps extends LabelHTMLAttributes<HTMLLabelElement> {
  children: React.ReactNode;
  className?: string;
}

export const Label = ({ children, className = "", ...props }: LabelProps) => (
  <label className={`text-sm font-semibold text-[#2C3E50] ${className}`} {...props}>
    {children}
  </label>
);