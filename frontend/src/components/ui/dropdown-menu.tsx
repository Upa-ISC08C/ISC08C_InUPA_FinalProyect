import { ReactNode } from 'react';

export const DropdownMenu = ({ children }: { children: ReactNode }) => <div className="relative">{children}</div>;

export const DropdownMenuTrigger = ({ children, asChild }: { children: ReactNode; asChild?: boolean }) => (
  <>{children}</>
);

export const DropdownMenuContent = ({ children, align = "end", className = "" }: { children: ReactNode; align?: string; className?: string }) => (
  <div className={`absolute right-0 mt-2 w-56 bg-white rounded-xl border border-[#E5E7EB] shadow-lg z-50 ${className}`}>
    {children}
  </div>
);

export const DropdownMenuLabel = ({ children, className = "" }: { children: ReactNode; className?: string }) => (
  <div className={`px-4 py-2 text-sm font-semibold text-[#2C3E50] ${className}`}>{children}</div>
);

export const DropdownMenuSeparator = () => (
  <div className="border-t border-[#E5E7EB] my-1" />
);

export const DropdownMenuItem = ({ children, className = "", asChild, onClick }: { children: ReactNode; className?: string; asChild?: boolean; onClick?: () => void }) => (
  <button onClick={onClick} className={`w-full text-left px-4 py-2 text-sm text-[#2C3E50] hover:bg-[#F5F7FA] transition-colors ${className}`}>
    {children}
  </button>
);