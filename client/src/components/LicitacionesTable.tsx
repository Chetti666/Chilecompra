import React, { useState } from 'react';
import { Licitacion, ItemLicitacion } from '../types';
import { Calendar, ChevronDown, ChevronUp, DollarSign, Award, Tag, Briefcase, FileText } from 'lucide-react';

interface LicitacionesTableProps {
  licitaciones: Licitacion[];
}

export default function LicitacionesTable({ licitaciones }: LicitacionesTableProps) {
  const [expandedRow, setExpandedRow] = useState<string | null>(null);

  const toggleRow = (codigo: string) => {
    if (expandedRow === codigo) {
      setExpandedRow(null);
    } else {
      setExpandedRow(codigo);
    }
  };

  // Helper para formatear el dinero en Peso Chileno (CLP)
  const formatCurrency = (amount?: number, currency = 'CLP') => {
    if (amount === undefined || amount === null) return 'No especificado';
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: currency,
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Helper para formatear fechas
  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '';
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) {
        // En caso de que venga con formato ddmmyyyy u otro string crudo
        return dateStr;
      }
      return new Intl.DateTimeFormat('es-CL', {
        dateStyle: 'medium',
        timeStyle: 'short'
      }).format(date);
    } catch {
      return dateStr;
    }
  };

  // Helper para obtener colores según el código de estado de la licitación
  const getStatusBadge = (codigoEstado: number, estadoText: string) => {
    // Estados comunes: Adjudicada = 8, Publicada = 6 (o similar), En Evaluación = 7, Desierta = 16, etc.
    let bg = 'bg-slate-800 text-slate-300 border-slate-700';
    let dot = 'bg-slate-400';

    switch (codigoEstado) {
      case 8: // Adjudicada
        bg = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
        dot = 'bg-emerald-400';
        break;
      case 6: // Publicada / Aceptada
      case 5: // Publicada
        bg = 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20';
        dot = 'bg-cyan-400';
        break;
      case 7: // En evaluación
        bg = 'bg-amber-500/10 text-amber-400 border-amber-500/20';
        dot = 'bg-amber-400';
        break;
      case 16: // Desierta
      case 19: // Revocada
      case 18: // Suspendida
        bg = 'bg-rose-500/10 text-rose-400 border-rose-500/20';
        dot = 'bg-rose-400';
        break;
      default:
        bg = 'bg-blue-500/10 text-blue-400 border-blue-500/20';
        dot = 'bg-blue-400';
    }

    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${bg}`}>
        <span className={`w-1.5 h-1.5 rounded-full ${dot} animate-pulse-subtle`}></span>
        {estadoText || `Estado ${codigoEstado}`}
      </span>
    );
  };

  if (licitaciones.length === 0) {
    return (
      <div className="text-center py-12 glass-card rounded-2xl p-8 border border-slate-800">
        <FileText className="w-12 h-12 mx-auto text-slate-500 mb-3" />
        <h3 className="text-lg font-medium text-slate-300">No se encontraron licitaciones</h3>
        <p className="text-sm text-slate-500 mt-1">Intenta consultar otra fecha en el panel superior.</p>
      </div>
    );
  }

  return (
    <div className="w-full overflow-hidden glass-card rounded-2xl border border-slate-800/80 shadow-2xl">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-850 bg-slate-900/50 text-slate-400 text-xs font-semibold uppercase tracking-wider">
              <th className="py-4 px-6">Código Externo</th>
              <th className="py-4 px-6">Licitación / Institución</th>
              <th className="py-4 px-6 hidden md:table-cell">Fecha Cierre</th>
              <th className="py-4 px-6 text-right">Monto Estimado</th>
              <th className="py-4 px-6 text-center">Estado</th>
              <th className="py-4 px-6 w-10"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-850/60">
            {licitaciones.map((lic) => {
              const isExpanded = expandedRow === lic.CodigoExterno;
              const hasItems = lic.Items && lic.Items.Listado && lic.Items.Listado.length > 0;
              const itemsList: ItemLicitacion[] = lic.Items?.Listado || [];
              
              return (
                <React.Fragment key={lic.CodigoExterno}>
                  {/* Fila Principal */}
                  <tr 
                    onClick={() => toggleRow(lic.CodigoExterno)}
                    className={`group cursor-pointer transition-colors duration-150 ${
                      isExpanded ? 'bg-chilecompra-950/20' : 'hover:bg-slate-800/35'
                    }`}
                  >
                    <td className="py-4 px-6 font-mono text-xs font-semibold text-chilecompra-400 group-hover:text-chilecompra-300 transition-colors">
                      {lic.CodigoExterno}
                    </td>
                    <td className="py-4 px-6 max-w-xs sm:max-w-md">
                      <div className="font-semibold text-sm text-slate-200 line-clamp-1 group-hover:text-white transition-colors">
                        {lic.Nombre}
                      </div>
                      <div className="text-xs text-slate-400 mt-0.5 font-medium flex items-center gap-1.5">
                        <Briefcase className="w-3 h-3 text-slate-500" />
                        {lic.Comprador?.NombreOrganismo}
                      </div>
                    </td>
                    <td className="py-4 px-6 hidden md:table-cell text-xs text-slate-300">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-500" />
                        {formatDate(lic.FechaCierre)}
                      </div>
                    </td>
                    <td className="py-4 px-6 text-right font-mono text-sm font-semibold text-slate-200">
                      {formatCurrency(lic.MontoEstimado || lic.MontoEstimated, lic.Moneda)}
                    </td>
                    <td className="py-4 px-6 text-center">
                      {getStatusBadge(lic.CodigoEstado, lic.Estado)}
                    </td>
                    <td className="py-4 px-6 text-center text-slate-500 group-hover:text-slate-300 transition-colors">
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </td>
                  </tr>

                  {/* Fila de Detalles Expandidos */}
                  {isExpanded && (
                    <tr className="bg-slate-900/40 border-t-0 animate-fade-in">
                      <td colSpan={6} className="py-6 px-8 border-b border-slate-850">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                          {/* Columna Izquierda: Información de la Licitación */}
                          <div className="lg:col-span-1 space-y-4">
                            <div>
                              <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Descripción</h4>
                              <p className="text-xs text-slate-300 leading-relaxed font-light bg-slate-900/60 p-3 rounded-lg border border-slate-800/80">
                                {lic.Descripcion || 'Sin descripción proporcionada.'}
                              </p>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                              <div className="bg-slate-900/30 p-2.5 rounded-lg border border-slate-800/30">
                                <span className="text-[10px] font-semibold text-slate-500 uppercase">Usuario Comprador</span>
                                <span className="block text-xs font-medium text-slate-300 truncate mt-0.5">
                                  {lic.Comprador?.NombreUsuario || 'No especificado'}
                                </span>
                              </div>
                              <div className="bg-slate-900/30 p-2.5 rounded-lg border border-slate-800/30">
                                <span className="text-[10px] font-semibold text-slate-500 uppercase">Cargo Usuario</span>
                                <span className="block text-xs font-medium text-slate-300 truncate mt-0.5">
                                  {lic.Comprador?.CargoUsuario || 'No especificado'}
                                </span>
                              </div>
                            </div>
                            
                            <div className="bg-slate-900/40 p-3 rounded-lg border border-slate-850 flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <Tag className="w-3.5 h-3.5 text-chilecompra-500" />
                                <span className="text-xs text-slate-400 font-medium">Moneda del Proceso:</span>
                              </div>
                              <span className="text-xs font-bold font-mono text-chilecompra-300 bg-chilecompra-500/10 px-2 py-0.5 rounded border border-chilecompra-500/20">
                                {lic.Moneda}
                              </span>
                            </div>
                          </div>

                          {/* Columna Derecha: Ítems Licitados */}
                          <div className="lg:col-span-2 space-y-3">
                            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                              <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                                <Briefcase className="w-3.5 h-3.5 text-chilecompra-400" />
                                Ítems de la Licitación ({itemsList.length})
                              </h4>
                              <span className="text-[10px] text-slate-500">Dictado bajo estándar ChileCompra</span>
                            </div>

                            {hasItems ? (
                              <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
                                {itemsList.map((item, idx) => (
                                  <div key={idx} className="bg-slate-900/60 p-4 rounded-xl border border-slate-800/80 hover:border-slate-750 transition-all">
                                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                                      <div>
                                        <span className="text-[9px] font-mono font-bold text-chilecompra-500 uppercase bg-chilecompra-500/10 px-1.5 py-0.5 rounded border border-chilecompra-500/20">
                                          Cód: {item.CodigoProducto}
                                        </span>
                                        <h5 className="text-xs font-semibold text-slate-200 mt-1.5">
                                          {item.NombreProducto}
                                        </h5>
                                        <p className="text-[11px] text-slate-400 mt-0.5">
                                          Categoría: <span className="text-slate-300">{item.Categoria}</span>
                                        </p>
                                        <p className="text-[11px] text-slate-400 mt-0.5">
                                          Cantidad Solicitada: <span className="text-slate-300 font-semibold">{item.Cantidad}</span>
                                        </p>
                                      </div>

                                      {/* Estado de Adjudicación del Ítem */}
                                      <div className="sm:text-right mt-2 sm:mt-0">
                                        {item.Adjudicacion ? (
                                          <div className="bg-emerald-500/5 p-2 rounded-lg border border-emerald-500/10 space-y-1">
                                            <div className="text-[10px] font-bold text-emerald-400 uppercase flex items-center gap-1 justify-start sm:justify-end">
                                              <Award className="w-3 h-3" /> Adjudicado
                                            </div>
                                            <div className="text-[11px] text-slate-200 font-medium truncate max-w-[180px]">
                                              {item.Adjudicacion.NombreProveedor}
                                            </div>
                                            <div className="text-[10px] font-mono text-slate-400">
                                              RUT: {item.Adjudicacion.RutProveedor}
                                            </div>
                                            <div className="text-xs font-semibold text-emerald-400 font-mono mt-1">
                                              {formatCurrency(item.Adjudicacion.MontoUnitario, lic.Moneda)} <span className="text-[9px] text-slate-500 font-light">c/u</span>
                                            </div>
                                          </div>
                                        ) : (
                                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium bg-slate-800 text-slate-400 border border-slate-700">
                                            No Adjudicado / Pendiente
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p className="text-xs text-slate-500 italic py-4">No se detallan ítems individuales en esta licitación.</p>
                            )}
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
