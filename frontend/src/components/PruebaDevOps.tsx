import React from 'react';
import { ShieldAlert } from 'lucide-react';

interface PruebaDevOpsProps {
  mensaje?: string;
}

export const PruebaDevOps: React.FC<PruebaDevOpsProps> = ({ mensaje = "Prueba DevOps" }) => {
  return (
    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-600 text-white font-bold text-xs shadow-md border border-red-700 animate-pulse">
      <ShieldAlert className="size-4 text-white" />
      <span>{mensaje} (Color: Rojo)</span>
    </div>
  );
};

export default PruebaDevOps;
