import { Proveedor } from '../types';
import { Building2, FileCode, Landmark, MapPin, CheckCircle2, Globe2 } from 'lucide-react';

interface ProveedorCardProps {
  proveedor: Proveedor;
}

export default function ProveedorCard({ proveedor }: ProveedorCardProps) {
  return (
    <div className="w-full glow-effect glass-card rounded-2xl p-6 shadow-xl border border-slate-800 animate-slide-up">
      {/* Encabezado de la Tarjeta */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-800 pb-4 mb-5">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-chilecompra-500/10 rounded-xl border border-chilecompra-500/20 text-chilecompra-400">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-slate-100 leading-tight">
                {proveedor.Nombre}
              </h3>
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            </div>
            <p className="text-xs text-slate-400 mt-1">Proveedor Registrado en ChileCompra</p>
          </div>
        </div>
        
        <div className="flex flex-row sm:flex-col items-center sm:items-end gap-2 sm:gap-0.5 shrink-0 bg-slate-900/60 sm:bg-transparent px-3 py-1.5 sm:p-0 rounded-lg border border-slate-800/40 sm:border-none">
          <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Código Mercado Público</span>
          <span className="text-sm font-bold font-mono text-chilecompra-400">{proveedor.Codigo}</span>
        </div>
      </div>

      {/* Contenido / Información */}
      <div className="space-y-4">
        {/* RUT */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-1 md:gap-4 items-start">
          <div className="text-xs font-semibold text-slate-500 uppercase flex items-center gap-1.5 py-0.5">
            <FileCode className="w-3.5 h-3.5 text-slate-400" />
            RUT
          </div>
          <div className="md:col-span-2 text-sm font-semibold font-mono text-slate-200">
            {proveedor.Rut}
          </div>
        </div>

        {/* Actividad Comercial */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-1 md:gap-4 items-start">
          <div className="text-xs font-semibold text-slate-500 uppercase flex items-center gap-1.5 py-0.5">
            <Landmark className="w-3.5 h-3.5 text-slate-400" />
            Giro / Actividad
          </div>
          <div className="md:col-span-2 text-xs text-slate-300 leading-relaxed font-light bg-slate-900/40 p-3 rounded-lg border border-slate-800/40">
            {proveedor.Actividad || 'Actividad comercial no especificada.'}
          </div>
        </div>

        {/* Ubicación y Dirección */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-1 md:gap-4 items-start">
          <div className="text-xs font-semibold text-slate-500 uppercase flex items-center gap-1.5 py-0.5">
            <MapPin className="w-3.5 h-3.5 text-slate-400" />
            Dirección
          </div>
          <div className="md:col-span-2 text-xs text-slate-300">
            <div className="font-medium text-slate-200">{proveedor.Direccion}</div>
            <div className="text-slate-400 mt-1 flex items-center gap-1.5">
              <span>{proveedor.Comuna}</span>
              <span className="text-slate-600">•</span>
              <span>{proveedor.Region}</span>
            </div>
          </div>
        </div>

        {/* País */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-1 md:gap-4 items-start">
          <div className="text-xs font-semibold text-slate-500 uppercase flex items-center gap-1.5 py-0.5">
            <Globe2 className="w-3.5 h-3.5 text-slate-400" />
            País
          </div>
          <div className="md:col-span-2 text-xs text-slate-300 flex items-center gap-1.5">
            <span>🇨🇱</span>
            <span>{proveedor.Pais || 'Chile'}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
