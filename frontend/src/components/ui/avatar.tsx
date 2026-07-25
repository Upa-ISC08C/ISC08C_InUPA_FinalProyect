import { ReactNode } from 'react';

export const Avatar = ({ children, className = "" }: { children: ReactNode; className?: string }) => (
  <div className={`size-10 rounded-full overflow-hidden ${className}`}>
    {children}
  </div>
);

export const AvatarImage = ({ src, alt }: { src?: string; alt?: string }) => (
  <img src={src} alt={alt} className="size-full object-cover" />
);

export const AvatarFallback = ({ 
  children, 
  className = "",
  style 
}: { 
  children: ReactNode; 
  className?: string;
  style?: React.CSSProperties;
}) => (
  <div 
    className={`size-full flex items-center justify-center bg-[#003366] text-white font-semibold ${className}`}
    style={style}
  >
    {children}
  </div>
);