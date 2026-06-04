import { useState, useEffect } from 'react';
import { Licitacion, Proveedor, LicitacionesApiResponse, ProveedorApiResponse } from './types';
import LicitacionesTable from './components/LicitacionesTable';
import ProveedorCard from './components/ProveedorCard';
import { 
  Building2, 
  Search, 
  Calendar, 
  Database, 
  AlertTriangle, 
  HelpCircle, 
  ExternalLink,
  Sliders,
  CheckCircle,
  Clock,
  WifiOff
} from 'lucide-react';

export default function App() {
  // Pestaña activa: 'licitaciones' | 'proveedores'
  const [activeTab, setActiveTab] = useState<'licitaciones' | 'proveedores'>('licitaciones');
  
  // Variables de configuración de la API
  const [modo, setModo] = useState<'demo' | 'prod'>('demo');
  const [ticket, setTicket] = useState<string>('');
  
  // Licitaciones
  const [fechaInput, setFechaInput] = useState<string>('2026-06-04'); // Fecha de hoy (04-06-2026) por defecto
  const [licitaciones, setLicitaciones] = useState<Licitacion[]>([]);
  const [licitacionesLoading, setLicitacionesLoading] = useState<boolean>(false);
  const [licitacionesError, setLicitacionesError] = useState<string | null>(null);
  const [licitacionesSource, setLicitacionesSource] = useState<string | null>(null);
  const [licitacionesWarning, setLicitacionesWarning] = useState<string | null>(null);

  // Proveedores
  const [rutInput, setRutInput] = useState<string>('');
  const [proveedor, setProveedor] = useState<Proveedor | null>(null);
  const [proveedorLoading, setProveedorLoading] = useState<boolean>(false);
  const [proveedorError, setProveedorError] = useState<string | null>(null);
  const [proveedorSource, setProveedorSource] = useState<string | null>(null);

  // Estado de la conexión del servidor proxy backend
  const [backendOnline, setBackendOnline] = useState<boolean>(true);
  const [serverHasTicket, setServerHasTicket] = useState<boolean>(false);

  // URL base del backend local
  const BACKEND_URL = 'http://localhost:3001/api';

  // Verificar si el servidor backend está corriendo al montar el componente
  useEffect(() => {
    fetch(`${BACKEND_URL}/status`)
      .then(res => res.json())
      .then(data => {
        const isOnline = data.status === 'online';
        setBackendOnline(isOnline);
        if (isOnline && data.hasEnvTicket) {
          setServerHasTicket(true);
          setModo('prod');
        }
        console.log("Servidor proxy detectado de forma exitosa:", data);
      })
      .catch(err => {
        setBackendOnline(false);
        console.error("No se pudo detectar el servidor proxy local corriendo en el puerto 3001.", err);
      });
  }, []);

  // Formatea la fecha de YYYY-MM-DD a DDMMAAAA
  const parseDateToDDMMAAAA = (dateStr: string): string => {
    const parts = dateStr.split('-');
    if (parts.length !== 3) return '';
    const [year, month, day] = parts;
    return `${day}${month}${year}`;
  };

  // Buscar licitaciones
  const handleSearchLicitaciones = async () => {
    const formattedDate = parseDateToDDMMAAAA(fechaInput);
    if (!formattedDate) {
      setLicitacionesError('Seleccione una fecha válida.');
      return;
    }

    setLicitacionesLoading(true);
    setLicitacionesError(null);
    setLicitacionesWarning(null);
    setLicitacionesSource(null);

    try {
      const headers: Record<string, string> = {};
      if (ticket) {
        headers['x-api-ticket'] = ticket;
      }

      const res = await fetch(`${BACKEND_URL}/licitaciones?fecha=${formattedDate}&modo=${modo}`, {
        headers
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || `Error en el servidor (${res.status})`);
      }

      const data: LicitacionesApiResponse = await res.json();
      
      setLicitaciones(data.Listado || []);
      setLicitacionesSource(data.source);
      if (data.warning) {
        setLicitacionesWarning(data.warning);
      }
    } catch (err: any) {
      console.error(err);
      setLicitacionesError(err.message || 'Error al conectar con el servidor.');
      setLicitaciones([]);
    } finally {
      setLicitacionesLoading(false);
    }
  };

  // Buscar proveedor por RUT
  const handleSearchProveedor = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rutInput.trim()) {
      setProveedorError('Ingrese un RUT para realizar la búsqueda.');
      return;
    }

    setProveedorLoading(true);
    setProveedorError(null);
    setProveedorSource(null);
    setProveedor(null);

    try {
      const headers: Record<string, string> = {};
      if (ticket) {
        headers['x-api-ticket'] = ticket;
      }

      const res = await fetch(`${BACKEND_URL}/proveedor?rut=${encodeURIComponent(rutInput)}&modo=${modo}`, {
        headers
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || `Error en el servidor (${res.status})`);
      }

      const data: ProveedorApiResponse = await res.json();
      
      if (data.Listado && data.Listado.length > 0) {
        setProveedor(data.Listado[0]);
        setProveedorSource(data.source);
      } else {
        setProveedorError('No se encontró información para el RUT ingresado.');
      }
    } catch (err: any) {
      console.error(err);
      setProveedorError(err.message || 'Error al conectar con el servidor.');
    } finally {
      setProveedorLoading(false);
    }
  };

  // Realizar búsqueda inicial al cambiar a pestaña o cargar
  useEffect(() => {
    if (activeTab === 'licitaciones' && licitaciones.length === 0 && backendOnline) {
      handleSearchLicitaciones();
    }
  }, [activeTab, backendOnline]);

  // Traducción y etiqueta de orígenes de datos
  const getSourceBadge = (source: string | null) => {
    if (!source) return null;
    
    let text = '';
    let style = '';
    
    switch (source) {
      case 'cache':
        text = 'Cargado de Caché Local (Velocidad instantánea)';
        style = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
        break;
      case 'official_api':
        text = 'API Oficial en Tiempo Real (Consumo de Cuota)';
        style = 'bg-blue-500/10 text-blue-400 border-blue-500/20';
        break;
      case 'demo_api':
        text = 'Modo Demo (Datos simulados sin cuota)';
        style = 'bg-purple-500/10 text-purple-400 border-purple-500/20';
        break;
      case 'fallback_cache':
        text = 'Caché de Respaldo (Fallo de API)';
        style = 'bg-amber-500/10 text-amber-400 border-amber-500/20';
        break;
      default:
        text = source;
        style = 'bg-slate-800 text-slate-400';
    }

    return (
      <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium border ${style} animate-fade-in`}>
        <Database className="w-3.5 h-3.5" />
        <span>Origen: {text}</span>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-chilecompra-500 selection:text-white">
      {/* Header Principal */}
      <header className="border-b border-slate-900 bg-slate-950/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-chilecompra-600 to-cyan-500 flex items-center justify-center font-bold text-lg text-white shadow-lg shadow-chilecompra-500/10">
              MP
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight text-white font-outfit">
                Mercado Público Chile
              </h1>
              <p className="text-xs text-slate-400 font-light">Panel Integrado de Consulta de Datos</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {backendOnline ? (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                Servidor Conectado
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-rose-500/10 text-rose-400 border border-rose-500/20">
                <WifiOff className="w-3.5 h-3.5" />
                Servidor Desconectado
              </span>
            )}
          </div>
        </div>
      </header>

      {/* Alerta si el servidor backend no está corriendo */}
      {!backendOnline && (
        <div className="bg-rose-500/10 border-b border-rose-500/20 py-3 px-4 text-center text-xs text-rose-300 flex items-center justify-center gap-2">
          <AlertTriangle className="w-4 h-4 text-rose-400" />
          <span>El servidor backend (puerto 3001) no responde. Por favor, inicia el backend con <code className="bg-slate-900 px-1.5 py-0.5 rounded font-mono text-white text-[11px]">npm run dev</code> en el directorio <code className="bg-slate-900 px-1.5 py-0.5 rounded font-mono text-white text-[11px]">/server</code> para habilitar la búsqueda.</span>
        </div>
      )}

      {/* Contenido Principal */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Banner Legal Obligatorio - Dirección ChileCompra */}
        <div className="bg-gradient-to-r from-chilecompra-900/40 to-slate-900/60 p-4 rounded-xl border border-chilecompra-800/40 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5 text-slate-300">
            <Sliders className="w-4 h-4 text-chilecompra-400 shrink-0" />
            <span>
              <strong>Aviso Legal de Uso de Datos:</strong> De acuerdo a la normativa vigente, la fuente oficial de toda la información no modificada expuesta en esta aplicación es la <strong>Dirección ChileCompra</strong>.
            </span>
          </div>
          <span className="text-slate-500 font-mono text-[10px] shrink-0 bg-slate-900/80 px-2 py-1 rounded">Fuente: ChileCompra</span>
        </div>

        {/* Layout en Dos Columnas: Configuración API (Izquierda) y Resultados (Derecha) */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
          
          {/* Columna Lateral - Configuración y Modo de Operación */}
          <div className="lg:col-span-1 space-y-6">
            <div className="glass-panel rounded-2xl p-5 space-y-5 border border-slate-800 shadow-lg">
              <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-chilecompra-400" />
                Conectividad API
              </h2>

              {/* Selector de Modo */}
              <div className="space-y-2">
                <label className="text-[11px] font-semibold text-slate-400 uppercase">Modo de Operación</label>
                <div className="grid grid-cols-2 gap-2 bg-slate-900/80 p-1 rounded-xl border border-slate-800">
                  <button
                    onClick={() => setModo('demo')}
                    className={`py-2 px-3 rounded-lg text-xs font-semibold transition-all ${
                      modo === 'demo'
                        ? 'bg-chilecompra-500 text-white shadow-md'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Modo Demo
                  </button>
                  <button
                    onClick={() => setModo('prod')}
                    className={`py-2 px-3 rounded-lg text-xs font-semibold transition-all ${
                      modo === 'prod'
                        ? 'bg-chilecompra-500 text-white shadow-md'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Producción
                  </button>
                </div>
              </div>

              {/* Input de Ticket de Acceso */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-[11px] font-semibold text-slate-400 uppercase">Ticket de Acceso (API Key)</label>
                  {modo === 'prod' && !ticket && !serverHasTicket && (
                    <span className="text-[9px] text-amber-400 font-medium">Requerido</span>
                  )}
                  {modo === 'prod' && !ticket && serverHasTicket && (
                    <span className="text-[9px] text-emerald-400 font-medium flex items-center gap-0.5">
                      <CheckCircle className="w-2.5 h-2.5" /> Servidor Activo
                    </span>
                  )}
                </div>
                <input
                  type="password"
                  value={ticket}
                  onChange={(e) => setTicket(e.target.value)}
                  placeholder={
                    modo === 'demo'
                      ? 'Simulado en modo demo'
                      : serverHasTicket
                        ? 'Configurado en el servidor (.env)'
                        : 'Ingrese su Ticket de API'
                  }
                  disabled={modo === 'demo'}
                  className={`w-full bg-slate-950/80 border rounded-xl py-2 px-3 text-xs font-mono transition-colors focus:outline-none focus:border-chilecompra-500 text-slate-200 ${
                    modo === 'demo' ? 'border-slate-800/40 text-slate-600 bg-slate-900/30 cursor-not-allowed' : 'border-slate-800'
                  }`}
                />
                {modo === 'prod' ? (
                  <p className="text-[10px] text-slate-500 leading-normal">
                    El ticket no se almacena en bases de datos externas. Se envía temporalmente a través del proxy seguro del servidor.
                  </p>
                ) : (
                  <p className="text-[10px] text-slate-500 leading-normal">
                    En Modo Demo no se requiere ticket. El proxy simula la estructura oficial de Mercado Público.
                  </p>
                )}
              </div>

              {/* Resumen del Límite de Cuota */}
              <div className="bg-slate-900/40 rounded-xl p-3.5 border border-slate-850 space-y-2">
                <div className="flex justify-between items-center text-[10px] text-slate-500 font-semibold uppercase">
                  <span>Cuota Diaria API</span>
                  <span className="text-slate-400">10,000 Peticiones</span>
                </div>
                <div className="w-full bg-slate-850 h-1.5 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${modo === 'demo' ? 'bg-purple-500 w-0' : 'bg-chilecompra-500 w-2.5'}`}></div>
                </div>
                <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-light mt-1">
                  <Clock className="w-3 h-3 text-chilecompra-400" />
                  <span>Caché en servidor activa (24h)</span>
                </div>
              </div>
            </div>

            {/* Canal Oficial de Soporte e Info */}
            <div className="glass-panel rounded-2xl p-5 space-y-4 border border-slate-800 shadow-lg text-xs">
              <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-800 pb-2">
                <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
                Soporte y API
              </h2>

              <div className="space-y-3 font-light text-slate-300">
                <p>
                  <strong>Soporte Oficial:</strong> Si experimentas problemas técnicos con la API, el canal oficial es el formulario de sugerencias de ChileCompra. El tiempo de respuesta comprometido es de hasta <strong>3 días hábiles</strong>.
                </p>
                <p>
                  <strong>Actualizaciones:</strong> Mercado Público puede modificar esquemas o campos de datos. Revisa periódicamente la sección de novedades en el portal de la API.
                </p>
              </div>

              <a 
                href="https://api.mercadopublico.cl" 
                target="_blank" 
                rel="noreferrer"
                className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-slate-900 border border-slate-800 hover:bg-slate-800 transition-colors text-slate-300 hover:text-white"
              >
                <span>Portal API Mercado Público</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>

          {/* Columna Principal - Panel de Navegación y Resultados */}
          <div className="lg:col-span-3 space-y-6">
            
            {/* Pestañas de Navegación (Tabs) */}
            <div className="flex border-b border-slate-900">
              <button
                onClick={() => setActiveTab('licitaciones')}
                className={`py-3.5 px-6 font-semibold text-sm transition-all border-b-2 flex items-center gap-2 ${
                  activeTab === 'licitaciones'
                    ? 'border-chilecompra-500 text-chilecompra-400 bg-chilecompra-500/5'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <Calendar className="w-4 h-4" />
                Licitaciones por Fecha
              </button>
              <button
                onClick={() => setActiveTab('proveedores')}
                className={`py-3.5 px-6 font-semibold text-sm transition-all border-b-2 flex items-center gap-2 ${
                  activeTab === 'proveedores'
                    ? 'border-chilecompra-500 text-chilecompra-400 bg-chilecompra-500/5'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <Building2 className="w-4 h-4" />
                Buscador de Proveedores (RUT)
              </button>
            </div>

            {/* PESTAÑA 1: LICITACIONES */}
            {activeTab === 'licitaciones' && (
              <div className="space-y-6 animate-fade-in">
                
                {/* Formulario de Búsqueda de Licitaciones */}
                <div className="glass-panel rounded-2xl p-6 border border-slate-800/80 shadow-md">
                  <div className="flex flex-col md:flex-row items-end gap-4">
                    <div className="flex-1 space-y-2">
                      <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                        Seleccionar Fecha de Creación/Consulta
                      </label>
                      <div className="relative">
                        <input
                          type="date"
                          value={fechaInput}
                          onChange={(e) => setFechaInput(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3.5 px-4 text-sm focus:outline-none focus:border-chilecompra-500 text-slate-200 block"
                        />
                      </div>
                    </div>

                    <button
                      onClick={handleSearchLicitaciones}
                      disabled={licitacionesLoading || !backendOnline}
                      className="w-full md:w-auto bg-gradient-to-r from-chilecompra-600 to-chilecompra-500 hover:from-chilecompra-500 hover:to-chilecompra-400 disabled:from-slate-800 disabled:to-slate-800 disabled:text-slate-500 disabled:cursor-not-allowed text-white font-semibold py-3.5 px-8 rounded-xl text-sm transition-all shadow-lg shadow-chilecompra-500/10 flex items-center justify-center gap-2 shrink-0"
                    >
                      {licitacionesLoading ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                          <span>Consultando...</span>
                        </>
                      ) : (
                        <>
                          <Search className="w-4 h-4" />
                          <span>Buscar Licitaciones</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Avisos de Caché / Errores */}
                {licitacionesWarning && (
                  <div className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-xl flex items-start gap-3 text-xs text-amber-300">
                    <AlertTriangle className="w-4.5 h-4.5 text-amber-400 shrink-0 mt-0.5" />
                    <span>{licitacionesWarning}</span>
                  </div>
                )}

                {licitacionesError && (
                  <div className="bg-rose-500/10 border border-rose-500/20 p-4 rounded-xl flex items-start gap-3 text-xs text-rose-300">
                    <AlertTriangle className="w-4.5 h-4.5 text-rose-400 shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <p className="font-semibold">Error al obtener datos:</p>
                      <p className="font-light leading-relaxed">{licitacionesError}</p>
                    </div>
                  </div>
                )}

                {/* Cabecera de Resultados */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                  <div>
                    <h3 className="text-base font-bold text-slate-200 font-outfit">Licitaciones Encontradas</h3>
                    <p className="text-xs text-slate-400 mt-0.5">Mostrando los campos principales del diccionario de datos</p>
                  </div>
                  {getSourceBadge(licitacionesSource)}
                </div>

                {/* Tabla de Licitaciones */}
                {!licitacionesLoading && (
                  <LicitacionesTable licitaciones={licitaciones} />
                )}

                {/* Spinner de Carga de Licitaciones */}
                {licitacionesLoading && (
                  <div className="py-20 text-center">
                    <div className="w-10 h-10 border-3 border-chilecompra-500/30 border-t-chilecompra-500 rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-xs text-slate-400">Obteniendo registros de Mercado Público...</p>
                  </div>
                )}
              </div>
            )}

            {/* PESTAÑA 2: BUSCADOR DE PROVEEDORES */}
            {activeTab === 'proveedores' && (
              <div className="space-y-6 animate-fade-in">
                
                {/* Formulario de Búsqueda de Proveedores */}
                <div className="glass-panel rounded-2xl p-6 border border-slate-800/80 shadow-md">
                  <form onSubmit={handleSearchProveedor} className="flex flex-col md:flex-row items-end gap-4">
                    <div className="flex-1 space-y-2">
                      <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                        Ingresar RUT de la Empresa / Proveedor
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          value={rutInput}
                          onChange={(e) => setRutInput(e.target.value)}
                          placeholder="Ej: 76.012.345-K o 76012345K"
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3.5 px-4 text-sm focus:outline-none focus:border-chilecompra-500 text-slate-200 block"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={proveedorLoading || !backendOnline}
                      className="w-full md:w-auto bg-gradient-to-r from-chilecompra-600 to-chilecompra-500 hover:from-chilecompra-500 hover:to-chilecompra-400 disabled:from-slate-800 disabled:to-slate-800 disabled:text-slate-500 disabled:cursor-not-allowed text-white font-semibold py-3.5 px-8 rounded-xl text-sm transition-all shadow-lg shadow-chilecompra-500/10 flex items-center justify-center gap-2 shrink-0"
                    >
                      {proveedorLoading ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                          <span>Buscando...</span>
                        </>
                      ) : (
                        <>
                          <Search className="w-4 h-4" />
                          <span>Buscar Código de Proveedor</span>
                        </>
                      )}
                    </button>
                  </form>
                </div>

                {/* Errores del Proveedor */}
                {proveedorError && (
                  <div className="bg-rose-500/10 border border-rose-500/20 p-4 rounded-xl flex items-start gap-3 text-xs text-rose-300">
                    <AlertTriangle className="w-4.5 h-4.5 text-rose-400 shrink-0 mt-0.5" />
                    <span>{proveedorError}</span>
                  </div>
                )}

                {/* Cabecera y origen */}
                {proveedor && (
                  <div className="flex justify-between items-center">
                    <h3 className="text-base font-bold text-slate-200 font-outfit">Ficha del Proveedor</h3>
                    {getSourceBadge(proveedorSource)}
                  </div>
                )}

                {/* Tarjeta de Proveedor */}
                {!proveedorLoading && proveedor && (
                  <ProveedorCard proveedor={proveedor} />
                )}

                {/* Spinner de Carga de Proveedor */}
                {proveedorLoading && (
                  <div className="py-20 text-center">
                    <div className="w-10 h-10 border-3 border-chilecompra-500/30 border-t-chilecompra-500 rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-xs text-slate-400">Consultando ficha de empresa...</p>
                  </div>
                )}

                {/* Estado vacío inicial */}
                {!proveedorLoading && !proveedor && !proveedorError && (
                  <div className="text-center py-16 glass-card rounded-2xl p-8 border border-slate-800">
                    <Building2 className="w-12 h-12 mx-auto text-slate-500 mb-3" />
                    <h3 className="text-sm font-semibold text-slate-300">Busca una Empresa por su RUT</h3>
                    <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto leading-normal">
                      Ingresa el RUT de cualquier proveedor del Estado para obtener su código oficial de Mercado Público y su información registrada.
                    </p>
                    <div className="mt-4 flex flex-wrap gap-2 justify-center">
                      <button 
                        onClick={() => setRutInput('76.012.345-K')}
                        className="text-[10px] bg-slate-900 hover:bg-slate-800 border border-slate-800 text-chilecompra-400 px-2 py-1 rounded transition-colors"
                      >
                        Cargar RUT Demo 1
                      </button>
                      <button 
                        onClick={() => setRutInput('88.777.666-4')}
                        className="text-[10px] bg-slate-900 hover:bg-slate-800 border border-slate-800 text-chilecompra-400 px-2 py-1 rounded transition-colors"
                      >
                        Cargar RUT Demo 2
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Footer Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-8 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 space-y-3">
          <p className="font-light">
            Aplicación de Integración de Servicios Web de Mercado Público de Chile • Desarrollada en React, Node.js y Tailwind CSS.
          </p>
          <div className="flex justify-center gap-6 text-[11px] text-slate-600">
            <span>Fuente: Dirección ChileCompra</span>
            <span>•</span>
            <span>Licencia MIT</span>
            <span>•</span>
            <span>Soporte: API@chilecompra.cl</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
