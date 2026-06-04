export interface Adjudicacion {
  RutProveedor: string;
  NombreProveedor: string;
  CantidadAdjudicada: number;
  MontoUnitario: number;
}

export interface ItemLicitacion {
  Correlativo: number;
  CodigoProducto: number;
  Categoria: string;
  NombreProducto: string;
  Cantidad: number;
  Adjudicacion: Adjudicacion | null;
}

export interface CompradorLicitacion {
  CodigoOrganismo: string;
  NombreOrganismo: string;
  RutUnidad: string;
  NombreUsuario?: string;
  CargoUsuario?: string;
}

export interface Licitacion {
  CodigoExterno: string;
  Nombre: string;
  Descripcion: string;
  CodigoEstado: number;
  Estado: string;
  FechaCierre: string;
  MontoEstimated?: number; // compatibilidad
  MontoEstimado?: number;   // oficial
  Moneda: string;
  Comprador: CompradorLicitacion;
  Items?: {
    Cantidad: number;
    Listado: ItemLicitacion[];
  };
}

export interface Proveedor {
  Codigo: string;
  Nombre: string;
  Actividad: string;
  Rut: string;
  Direccion: string;
  Comuna: string;
  Region: string;
  Pais: string;
}

export interface LicitacionesApiResponse {
  Cantidad: number;
  FechaCreacion: string;
  Version: string;
  Listado: Licitacion[];
  source: 'cache' | 'demo_api' | 'official_api' | 'fallback_cache';
  warning?: string;
  error?: string;
}

export interface ProveedorApiResponse {
  Cantidad: number;
  FechaCreacion: string;
  Version: string;
  Listado: Proveedor[];
  source: 'cache' | 'demo_api' | 'official_api' | 'fallback_cache';
  warning?: string;
  error?: string;
}
