import { ReactNode } from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  className?: string;
}

export const Card = ({ children, className = "", ...props }: CardProps) => (
  <div 
    className={`bg-white rounded-xl border border-[#E5E7EB] shadow-sm ${className}`}
    {...props}
  >
    {children}
  </div>
);

export const CardContent = ({ children, className = "", ...props }: CardProps) => (
  <div className={`p-5 ${className}`} {...props}>
    {children}
  </div>
);

export const CardHeader = ({ children, className = "", ...props }: CardProps) => (
  <div className={`p-5 pb-3 ${className}`} {...props}>
    {children}
  </div>
);

export const CardTitle = ({ children, className = "", ...props }: CardProps) => (
  <h3 className={`text-base font-bold text-[#2C3E50] ${className}`} {...props}>
    {children}
  </h3>
);