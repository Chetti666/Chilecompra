import fs from 'fs';
import path from 'path';

const CACHE_DIR = path.join(__dirname, '..', '..', '.cache');

// Asegurar que el directorio de caché exista
if (!fs.existsSync(CACHE_DIR)) {
  fs.mkdirSync(CACHE_DIR, { recursive: true });
}

interface CacheOptions {
  /** Tiempo de vida de la caché en milisegundos. Por defecto 24 horas. */
  ttlMs?: number;
}

const DEFAULT_TTL = 24 * 60 * 60 * 1000; // 24 horas en milisegundos

/**
 * Normaliza una clave para que sea un nombre de archivo válido.
 */
function getCacheFilePath(key: string): string {
  const safeKey = key.replace(/[^a-zA-Z0-9_-]/g, '_');
  return path.join(CACHE_DIR, `${safeKey}.json`);
}

/**
 * Obtiene un elemento de la caché si no ha expirado.
 */
export function get<T>(key: string, options: CacheOptions = {}): T | null {
  const filePath = getCacheFilePath(key);
  const ttl = options.ttlMs ?? DEFAULT_TTL;

  if (!fs.existsSync(filePath)) {
    return null;
  }

  try {
    const stats = fs.statSync(filePath);
    const ageMs = Date.now() - stats.mtimeMs;

    if (ageMs > ttl) {
      // La caché expiró, la borramos de manera asíncrona
      fs.unlink(filePath, () => {});
      return null;
    }

    const content = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(content) as T;
  } catch (error) {
    console.error(`Error al leer la caché para la clave: ${key}`, error);
    return null;
  }
}

/**
 * Guarda un elemento en la caché.
 */
export function set<T>(key: string, value: T): void {
  const filePath = getCacheFilePath(key);
  try {
    const content = JSON.stringify(value, null, 2);
    fs.writeFileSync(filePath, content, 'utf-8');
  } catch (error) {
    console.error(`Error al escribir en la caché para la clave: ${key}`, error);
  }
}

/**
 * Borra una clave específica de la caché.
 */
export function invalidate(key: string): void {
  const filePath = getCacheFilePath(key);
  if (fs.existsSync(filePath)) {
    try {
      fs.unlinkSync(filePath);
    } catch (error) {
      console.error(`Error al invalidar la caché para la clave: ${key}`, error);
    }
  }
}

/**
 * Limpia toda la caché del directorio.
 */
export function clearAll(): void {
  try {
    const files = fs.readdirSync(CACHE_DIR);
    for (const file of files) {
      if (file.endsWith('.json')) {
        fs.unlinkSync(path.join(CACHE_DIR, file));
      }
    }
  } catch (error) {
    console.error('Error al limpiar todo el directorio de caché', error);
  }
}
