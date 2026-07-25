import { ReactNode } from 'react';

export const Dialog = ({ open, onOpenChange, children }: { open: boolean; onOpenChange: (open: boolean) => void; children: ReactNode }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => onOpenChange(false)}>
      {children}
    </div>
  );
};

export const DialogContent = ({ children, className = "", onClick }: { children: ReactNode; className?: string; onClick?: (e: React.MouseEvent) => void }) => (
  <div 
    className={`bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto relative ${className}`} 
    onClick={(e) => {
      e.stopPropagation();
      onClick?.(e);
    }}
  >
    {children}
  </div>
);

export const DialogHeader = ({ children, className = "" }: { children: ReactNode; className?: string }) => (
  <div className={`px-6 pt-6 pb-4 border-b border-[#E5E7EB] ${className}`}>
    {children}
  </div>
);

export const DialogTitle = ({ children, className = "" }: { children: ReactNode; className?: string }) => (
  <h2 className={`text-lg font-bold text-[#2C3E50] ${className}`}>
    {children}
  </h2>
);