import { ReactNode } from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  className?: string;
  variant?: 'default' | 'outline';
}

export const Button = ({ children, className = "", variant = 'default', ...props }: ButtonProps) => {
  const baseStyles = "h-11 px-5 rounded-xl text-sm font-semibold transition-colors disabled:opacity-50";
  const variantStyles = variant === 'outline' 
    ? "border border-[#E5E7EB] text-[#7F8C8D] hover:bg-[#F5F7FA]"
    : "bg-[#003366] text-white hover:bg-[#002244]";
  
  return (
    <button className={`${baseStyles} ${variantStyles} ${className}`} {...props}>
      {children}
    </button>
  );
};