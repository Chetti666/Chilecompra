import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import axios from 'axios';
import * as cache from './utils/cache';
import { getMockLicitaciones, getMockProveedor } from './utils/mockData';

// Cargar variables de entorno
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Configurar middlewares
app.use(cors());
app.use(express.json());

/**
 * Función helper para formatear el RUT chileno.
 * Inserta puntos y guion si no están presentes.
 * Ejemplo: "76012345k" -> "76.012.345-K"
 */
function formatRut(rut: string): string {
  // Limpiar caracteres extraños, dejar solo números y K
  const clean = rut.replace(/[^0-9kK]/g, '').toUpperCase();
  
  if (clean.length < 2) return clean;
  
  const dv = clean.slice(-1);
  const cuerpo = clean.slice(0, -1);
  
  // Agregar puntos al cuerpo
  let cuerpoFormateado = '';
  let cont = 0;
  for (let i = cuerpo.length - 1; i >= 0; i--) {
    cuerpoFormateado = cuerpo.charAt(i) + cuerpoFormateado;
    cont++;
    if (cont === 3 && i !== 0) {
      cuerpoFormateado = '.' + cuerpoFormateado;
      cont = 0;
    }
  }
  
  return `${cuerpoFormateado}-${dv}`;
}

/**
 * Endpoint para obtener licitaciones por fecha.
 * GET /api/licitaciones?fecha=DDMMAAAA&modo=demo|prod
 */
app.get('/api/licitaciones', async (req: Request, res: Response) => {
  try {
    const fecha = req.query.fecha as string;
    const queryModo = req.query.modo as string;
    const clientTicket = req.headers['x-api-ticket'] as string || req.query.ticket as string;
    
    // Obtener ticket de .env o del cliente
    const envTicket = process.env.MERCADO_PUBLICO_TICKET;
    const activeTicket = clientTicket || envTicket;
    
    // Determinar modo (demo por defecto si no hay ticket o si se pide explícitamente)
    let modo = 'demo';
    if (queryModo === 'prod' && activeTicket) {
      modo = 'prod';
    } else if (queryModo === 'prod' && !activeTicket) {
      return res.status(400).json({
        error: "Se requiere un ticket de acceso (API Key) válido para ejecutar en Modo Producción."
      });
    }

    // Validar fecha (debe ser DDMMAAAA)
    if (!fecha || !/^\d{8}$/.test(fecha)) {
      return res.status(400).json({
        error: "Formato de fecha inválido. Debe proporcionar una fecha de 8 dígitos en formato DDMMAAAA (ej: 04062026)."
      });
    }

    const cacheKey = `licitaciones_${modo}_${fecha}`;
    
    // 1. Intentar obtener desde la caché fresca (24 horas de expiración)
    const cachedData = cache.get<any>(cacheKey);
    if (cachedData) {
      console.log(`[Cache Hit] Licitaciones fecha: ${fecha} (Modo: ${modo})`);
      return res.json({ ...cachedData, source: 'cache' });
    }

    console.log(`[Cache Miss] Consultando licitaciones fecha: ${fecha} (Modo: ${modo})`);

    // 2. Resolver según el modo
    if (modo === 'demo') {
      const data = getMockLicitaciones(fecha);
      cache.set(cacheKey, data);
      return res.json({ ...data, source: 'demo_api' });
    } else {
      // Modo Producción
      try {
        const url = `https://api.mercadopublico.cl/servicios/v1/publico/licitaciones.json?fecha=${fecha}&ticket=${activeTicket}`;
        const response = await axios.get(url, { timeout: 15000 });
        
        // La API de Mercado Público a veces devuelve errores en un formato JSON específico en vez de lanzar status de error HTTP
        const data = response.data;
        
        if (data && (data.error || data.message || data.Mensaje)) {
          throw new Error(data.error || data.message || data.Mensaje || "Error en la respuesta de la API");
        }

        // Guardar en la caché
        cache.set(cacheKey, data);
        return res.json({ ...data, source: 'official_api' });
      } catch (apiError: any) {
        console.error(`Error al conectar con la API de Mercado Público:`, apiError.message);
        
        // 3. Fallback: Si la API falla (límite excedido o caída), buscar en caché aunque haya expirado
        // Usamos un TTL muy alto (por ejemplo, 10 días) para obtener caché de emergencia
        const fallbackData = cache.get<any>(cacheKey, { ttlMs: 10 * 24 * 60 * 60 * 1000 });
        if (fallbackData) {
          console.warn(`[Fallback Cache] Respondiendo con caché de emergencia debido a falla de la API.`);
          return res.json({ 
            ...fallbackData, 
            source: 'fallback_cache',
            warning: "Datos cargados de caché local debido a indisponibilidad o límite de cuota excedido en la API oficial." 
          });
        }
        
        return res.status(502).json({
          error: "No se pudo obtener información de la API de Mercado Público.",
          details: apiError.message,
          helper: "Si el error indica límite excedido (10,000 peticiones diarias), puede alternar la aplicación a 'Modo Demo' para continuar interactuando con datos simulados."
        });
      }
    }
  } catch (error: any) {
    console.error(`Error en servidor:`, error);
    res.status(500).json({ error: "Error interno del servidor proxy.", details: error.message });
  }
});

/**
 * Endpoint para buscar proveedor por RUT.
 * GET /api/proveedor?rut=RUT&modo=demo|prod
 */
app.get('/api/proveedor', async (req: Request, res: Response) => {
  try {
    const rawRut = req.query.rut as string;
    const queryModo = req.query.modo as string;
    const clientTicket = req.headers['x-api-ticket'] as string || req.query.ticket as string;
    
    // Obtener ticket de .env o del cliente
    const envTicket = process.env.MERCADO_PUBLICO_TICKET;
    const activeTicket = clientTicket || envTicket;

    if (!rawRut) {
      return res.status(400).json({ error: "El parámetro RUT es requerido." });
    }

    const cleanRut = formatRut(rawRut);

    // Determinar modo
    let modo = 'demo';
    if (queryModo === 'prod' && activeTicket) {
      modo = 'prod';
    } else if (queryModo === 'prod' && !activeTicket) {
      return res.status(400).json({
        error: "Se requiere un ticket de acceso (API Key) válido para ejecutar en Modo Producción."
      });
    }

    // Usaremos un TTL mayor para proveedores (ej. 30 días), ya que los datos de la empresa raramente cambian
    const PROVIDER_TTL = 30 * 24 * 60 * 60 * 1000;
    const cacheKey = `proveedor_${modo}_${cleanRut}`;

    // 1. Buscar en caché
    const cachedData = cache.get<any>(cacheKey, { ttlMs: PROVIDER_TTL });
    if (cachedData) {
      console.log(`[Cache Hit] Proveedor RUT: ${cleanRut} (Modo: ${modo})`);
      return res.json({ ...cachedData, source: 'cache' });
    }

    console.log(`[Cache Miss] Consultando proveedor RUT: ${cleanRut} (Modo: ${modo})`);

    // 2. Resolver según el modo
    if (modo === 'demo') {
      const data = getMockProveedor(cleanRut);
      cache.set(cacheKey, data);
      return res.json({ ...data, source: 'demo_api' });
    } else {
      // Modo Producción
      try {
        const url = `https://api.mercadopublico.cl/servicios/v1/Publico/Empresas/BuscarProveedor?rutempresaproveedor=${encodeURIComponent(cleanRut)}&ticket=${activeTicket}`;
        const response = await axios.get(url, { timeout: 15000 });
        const data = response.data;

        if (data && (data.error || data.message || data.Mensaje)) {
          throw new Error(data.error || data.message || data.Mensaje || "Error en la API de Mercado Público");
        }

        // Guardar en la caché
        cache.set(cacheKey, data);
        return res.json({ ...data, source: 'official_api' });
      } catch (apiError: any) {
        console.error(`Error al consultar proveedor en API oficial:`, apiError.message);

        // Fallback caché de emergencia (180 días)
        const fallbackData = cache.get<any>(cacheKey, { ttlMs: 180 * 24 * 60 * 60 * 1000 });
        if (fallbackData) {
          console.warn(`[Fallback Cache] Proveedor devuelto de caché de emergencia.`);
          return res.json({ 
            ...fallbackData, 
            source: 'fallback_cache',
            warning: "Datos cargados de caché local de emergencia." 
          });
        }

        return res.status(502).json({
          error: "No se pudo obtener información del proveedor desde Mercado Público.",
          details: apiError.message
        });
      }
    }
  } catch (error: any) {
    console.error(`Error en servidor:`, error);
    res.status(500).json({ error: "Error interno del servidor.", details: error.message });
  }
});

// Ruta de estado del servidor
app.get('/api/status', (req: Request, res: Response) => {
  res.json({
    status: 'online',
    port: PORT,
    hasEnvTicket: !!process.env.MERCADO_PUBLICO_TICKET,
    time: new Date().toISOString()
  });
});

// Levantar el servidor
app.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(` Servidor Proxy de Mercado Público corriendo en:`);
  console.log(` http://localhost:${PORT}`);
  console.log(`=======================================================`);
});
