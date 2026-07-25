import { ReactNode } from 'react';

export const Select = ({ children, value, onValueChange }: { children: ReactNode; value?: string; onValueChange?: (val: string) => void }) => (
  <select 
    value={value} 
    onChange={(e) => onValueChange?.(e.target.value)}
    className="w-full h-11 rounded-xl border border-[#D1D5DB] px-3 text-sm focus:border-[#003366] focus:ring-1 focus:ring-[#003366] outline-none bg-white"
  >
    {children}
  </select>
);

export const SelectTrigger = ({ children, className = "" }: { children: ReactNode; className?: string }) => (
  <div className={className}>{children}</div>
);

export const SelectValue = ({ placeholder }: { placeholder?: string }) => (
  <span className="text-[#7F8C8D]">{placeholder}</span>
);

export const SelectContent = ({ children }: { children: ReactNode }) => (
  <>{children}</>
);

export const SelectItem = ({ children, value }: { children: ReactNode; value: string }) => (
  <option value={value}>{children}</option>
);