import { ReactNode, useState } from 'react';

export const Tabs = ({ defaultValue, children, className = "" }: { defaultValue: string; children: ReactNode; className?: string }) => {
  const [activeTab, setActiveTab] = useState(defaultValue);
  return (
    <div className={className} data-active-tab={activeTab}>
      {children}
    </div>
  );
};

export const TabsList = ({ children, className = "" }: { children: ReactNode; className?: string }) => (
  <div className={`flex gap-2 ${className}`}>{children}</div>
);

export const TabsTrigger = ({ value, children, className = "" }: { value: string; children: ReactNode; className?: string }) => {
  const isActive = document.querySelector('[data-active-tab]')?.getAttribute('data-active-tab') === value;
  return (
    <button
      onClick={() => {
        const tabsEl = document.querySelector('[data-active-tab]');
        if (tabsEl) tabsEl.setAttribute('data-active-tab', value);
      }}
      className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
        isActive ? "bg-white text-[#003366] shadow-sm" : "text-[#7F8C8D] hover:text-[#2C3E50]"
      } ${className}`}
    >
      {children}
    </button>
  );
};

export const TabsContent = ({ value, children, className = "" }: { value: string; children: ReactNode; className?: string }) => (
  <div className={className}>{children}</div>
);