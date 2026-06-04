/**
 * Genera una lista simulada de licitaciones estructurada exactamente como el JSON oficial de Mercado Público.
 * Ruta en la API oficial: Licitaciones/Listado/Licitacion/...
 */
export function getMockLicitaciones(fechaStr: string) {
  // Formatear la fecha para mostrar en los datos
  const dia = fechaStr.substring(0, 2);
  const mes = fechaStr.substring(2, 4);
  const anio = fechaStr.substring(4, 8);
  const fechaFormateada = `${anio}-${mes}-${dia}`;

  return {
    Cantidad: 5,
    FechaCreacion: new Date().toISOString(),
    Version: "v1",
    Listado: [
      {
        CodigoExterno: "1001-22-LP26",
        Nombre: "Adquisición de equipamiento computacional para Hospital Regional",
        Descripcion: "Licitación pública para la renovación de servidores y computadoras de escritorio para el personal médico e informático del Hospital Regional de Valparaíso.",
        CodigoEstado: 8, // Licitación Adjudicada
        Estado: "Adjudicada",
        FechaCierre: `${fechaFormateada}T15:00:00`,
        MontoEstimado: 45000000,
        Moneda: "CLP",
        Comprador: {
          CodigoOrganismo: "7210",
          NombreOrganismo: "Servicio de Salud Valparaíso San Antonio",
          RutUnidad: "70.224.200-5",
          NombreUsuario: "María José Olivares",
          CargoUsuario: "Jefa de Abastecimiento"
        },
        Items: {
          Cantidad: 2,
          Listado: [
            {
              Correlativo: 1,
              CodigoProducto: 43211501,
              Categoria: "Computadores de escritorio",
              NombreProducto: "Estaciones de trabajo Core i7 16GB RAM",
              Cantidad: 30,
              Adjudicacion: {
                RutProveedor: "76.012.345-K",
                NombreProveedor: "Tecnología y Sistemas Limitada",
                CantidadAdjudicada: 30,
                MontoUnitario: 850000
              }
            },
            {
              Correlativo: 2,
              CodigoProducto: 43201803,
              Categoria: "Servidores",
              NombreProducto: "Servidor Rack 2U Enterprise",
              Cantidad: 2,
              Adjudicacion: {
                RutProveedor: "76.012.345-K",
                NombreProveedor: "Tecnología y Sistemas Limitada",
                CantidadAdjudicada: 2,
                MontoUnitario: 9750000
              }
            }
          ]
        }
      },
      {
        CodigoExterno: "2544-15-LE26",
        Nombre: "Servicio de mantención preventiva de áreas verdes comunales",
        Descripcion: "Contratación de servicio mensual para la poda, riego y cuidado general de plazas, parques y bandejones centrales de la comuna de Providencia.",
        CodigoEstado: 6, // Aceptada / En Proceso
        Estado: "Publicada",
        FechaCierre: `${fechaFormateada}T18:00:00`,
        MontoEstimado: 28000000,
        Moneda: "CLP",
        Comprador: {
          CodigoOrganismo: "6504",
          NombreOrganismo: "I. Municipalidad de Providencia",
          RutUnidad: "69.070.300-8",
          NombreUsuario: "Carlos Pizarro",
          CargoUsuario: "Director de Medio Ambiente y Aseo"
        },
        Items: {
          Cantidad: 1,
          Listado: [
            {
              Correlativo: 1,
              CodigoProducto: 70111706,
              Categoria: "Servicios de mantenimiento y cuidado de plantas y árboles",
              NombreProducto: "Mantención mensual áreas verdes sector 3",
              Cantidad: 12,
              Adjudicacion: null // Aún no adjudicado
            }
          ]
        }
      },
      {
        CodigoExterno: "4587-108-LQ26",
        Nombre: "Suministro de raciones de contingencia para emergencias comunales",
        Descripcion: "Suministro de cajas de alimentos no perecibles listas para el consumo en situaciones de catástrofe u emergencias climatológicas locales.",
        CodigoEstado: 8, // Adjudicada
        Estado: "Adjudicada",
        FechaCierre: `${fechaFormateada}T12:30:00`,
        MontoEstimado: 12500000,
        Moneda: "CLP",
        Comprador: {
          CodigoOrganismo: "5580",
          NombreOrganismo: "Delegación Presidencial Regional de Tarapacá",
          RutUnidad: "60.992.000-7",
          NombreUsuario: "Javier Tapia",
          CargoUsuario: "Coordinador Regional de Emergencias"
        },
        Items: {
          Cantidad: 1,
          Listado: [
            {
              Correlativo: 1,
              CodigoProducto: 50192701,
              Categoria: "Comidas preparadas envasadas",
              NombreProducto: "Raciones alimenticias de emergencia tipo A",
              Cantidad: 2500,
              Adjudicacion: {
                RutProveedor: "88.777.666-4",
                NombreProveedor: "Alimentos del Sur S.A.",
                CantidadAdjudicada: 2500,
                MontoUnitario: 5000
              }
            }
          ]
        }
      },
      {
        CodigoExterno: "1202-45-CO26",
        Nombre: "Habilitación de luminarias LED peatonales en Av. Libertad",
        Descripcion: "Obras civiles y de instalación eléctrica para la implementación de postes de luz solar y luminarias LED en tramo peatonal de Avenida Libertad.",
        CodigoEstado: 7, // En Evaluación
        Estado: "En Evaluación",
        FechaCierre: `${fechaFormateada}T14:00:00`,
        MontoEstimado: 89000000,
        Moneda: "CLP",
        Comprador: {
          CodigoOrganismo: "8811",
          NombreOrganismo: "I. Municipalidad de Viña del Mar",
          RutUnidad: "69.070.500-0",
          NombreUsuario: "Fernanda Gómez",
          CargoUsuario: "Directora de Obras Municipales"
        },
        Items: {
          Cantidad: 1,
          Listado: [
            {
              Correlativo: 1,
              CodigoProducto: 39111609,
              Categoria: "Alumbrado público y accesorios",
              NombreProducto: "Focos LED Peatonales Solares 100W",
              Cantidad: 120,
              Adjudicacion: null
            }
          ]
        }
      },
      {
        CodigoExterno: "808-14-L126",
        Nombre: "Adquisición de insumos de escritorio y papelería institucional",
        Descripcion: "Compra anual consolidada de carpetas, cuadernos, lápices, papel multipropósito y otros insumos de oficina para las reparticiones gubernamentales de la SEC.",
        CodigoEstado: 16, // Desierta
        Estado: "Desierta",
        FechaCierre: `${fechaFormateada}T11:00:00`,
        MontoEstimado: 3200000,
        Moneda: "CLP",
        Comprador: {
          CodigoOrganismo: "9912",
          NombreOrganismo: "Superintendencia de Electricidad y Combustibles",
          RutUnidad: "70.080.600-6",
          NombreUsuario: "Roberto Sanhueza",
          CargoUsuario: "Analista de Operaciones e Infraestructura"
        },
        Items: {
          Cantidad: 1,
          Listado: [
            {
              Correlativo: 1,
              CodigoProducto: 44122011,
              Categoria: "Papel de oficina",
              NombreProducto: "Resmas de papel carta 75g (caja de 10 unidades)",
              Cantidad: 150,
              Adjudicacion: null
            }
          ]
        }
      }
    ]
  };
}

/**
 * Genera la respuesta simulada para un proveedor consultado por su RUT.
 * Estructura de retorno oficial: Cantidad, FechaCreacion, Version, Listado: [ { Codigo, Nombre, Actividad, Rut, ... } ]
 */
export function getMockProveedor(rutOriginal: string) {
  // Limpiar RUT para simular la lógica
  const cleanRut = rutOriginal.trim().toUpperCase();

  // Diccionario de proveedores simulados conocidos
  const proveedoresFicticios: Record<string, { Codigo: string; Nombre: string; Actividad: string; Direccion: string; Comuna: string; Region: string }> = {
    "76.012.345-K": {
      Codigo: "105432",
      Nombre: "Tecnología y Sistemas Limitada",
      Actividad: "Venta de equipos informáticos, redes, soporte técnico corporativo y servidores de alta gama.",
      Direccion: "Av. Providencia 1254, Oficina 501",
      Comuna: "Providencia",
      Region: "Región Metropolitana"
    },
    "88.777.666-4": {
      Codigo: "98745",
      Nombre: "Alimentos del Sur S.A.",
      Actividad: "Elaboración de raciones de campaña, distribución mayorista de alimentos envasados y logística de emergencias.",
      Direccion: "Ruta 5 Sur, Km 230",
      Comuna: "Talca",
      Region: "Región del Maule"
    },
    "77.222.111-9": {
      Codigo: "112450",
      Nombre: "Constructoras e Ingeniería Civil del Norte Ltda.",
      Actividad: "Obras viales, edificación pública, instalación eléctrica industrial y consultoría en ingeniería.",
      Direccion: "Avenida Prat 450",
      Comuna: "Antofagasta",
      Region: "Región de Antofagasta"
    }
  };

  // Buscar si el RUT consultado ya está en nuestro diccionario. Si no, generamos uno genérico al vuelo.
  const info = proveedoresFicticios[cleanRut] || {
    Codigo: String(Math.floor(100000 + Math.random() * 900000)),
    Nombre: `Empresa Comercializadora ${cleanRut.split('-')[0]} SpA`,
    Actividad: "Servicios generales de abastecimiento de bienes y servicios a organismos del Estado.",
    Direccion: "Avenida Libertador Bernardo O'Higgins 3450",
    Comuna: "Santiago Centro",
    Region: "Región Metropolitana"
  };

  return {
    Cantidad: 1,
    FechaCreacion: new Date().toISOString(),
    Version: "v1",
    Listado: [
      {
        Codigo: info.Codigo,
        Nombre: info.Nombre,
        Actividad: info.Actividad,
        Rut: cleanRut,
        Direccion: info.Direccion,
        Comuna: info.Comuna,
        Region: info.Region,
        Pais: "Chile"
      }
    ]
  };
}
