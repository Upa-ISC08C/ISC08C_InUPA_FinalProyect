import { InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  className?: string;
}

export const Input = ({ className = "", ...props }: InputProps) => (
  <input
    className={`w-full h-11 rounded-xl border border-[#D1D5DB] px-3 text-sm focus:border-[#003366] focus:ring-1 focus:ring-[#003366] outline-none ${className}`}
    {...props}
  />
);