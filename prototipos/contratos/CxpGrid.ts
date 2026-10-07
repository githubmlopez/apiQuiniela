// ==================================================================
// Contrato: Grid de selección de Cuentas por Pagar (CxP)
// Servicio:  POST /api/Query/Consulta
// Query:     catálogo de queries, id pendiente de asignar (ID_QUERY_GRID_CXP)
//
// Devuelve las cuentas por pagar de una empresa y un periodo, con su cuadre
// (importe de la factura contra la suma de sus partidas) y su situación.
// ==================================================================

/** Id del query en el catálogo. Pendiente de asignar al registrarlo. */
export const ID_QUERY_GRID_CXP = 0;

// ------------------------------------------------------------------
// Petición
// ------------------------------------------------------------------

/** Filtro de situación ($4). */
export type FiltroSituacionCxp =
  | 'A'    // Activas (conciliadas o no)
  | 'P'    // Activas sin conciliar
  | 'CO'   // Conciliadas
  | 'C'    // Canceladas
  | '';    // Todas (también null u omitido)

export interface ParamsGridCxp {
  /** Clave de empresa (CVE_EMPRESA). Obligatorio. */
  $1: string;
  /** Periodo AAAAMM, p. ej. "202610". Obligatorio. Al abrir la pantalla: mes en curso. */
  $2: string;
  /** Id del proveedor. 0, null u omitido = todos los proveedores. */
  $3?: number | null;
  /** Situación. '', null u omitido = todas. Al abrir la pantalla: 'A'. */
  $4?: FiltroSituacionCxp | null;
}

export interface PeticionGridCxp {
  idProceso: number;
  idQuery: number;
  parmRemp: ParamsGridCxp;
}

// ------------------------------------------------------------------
// Respuesta
// ------------------------------------------------------------------

/** Cuadre de la cuenta: importe bruto de la factura contra la suma de (bruto - descuento) de sus partidas. */
export type CuadreCxp =
  | 'SP'   // Sin partidas
  | 'CU'   // Cuadra
  | 'FA'   // Faltan partidas (diferencia > 0)
  | 'EX';  // Las partidas exceden el importe (diferencia < 0)

/** Situación ya traducida para mostrar. */
export type SituacionCxp = 'Activa' | 'Conciliada' | 'Cancelada';

/** Un renglón del grid. */
export interface CuentaGridCxp {
  /** Llave de la cuenta (junto con la empresa). Se usa para abrir el detalle; no se muestra. */
  uuid: string;
  /** Folio de la cuenta (columna "Folio"). */
  idConciliaCxp: number;
  /** Fecha de operación, "AAAA-MM-DD". */
  fOperacion: string;
  idProveedor: number;
  /** Nombre del proveedor. Puede venir null si el proveedor no tiene nombre capturado. */
  nomProveedor: string | null;
  /** Importe bruto de la factura (total de control). */
  impBruto: number;
  /** Número de partidas registradas. */
  numPartidas: number;
  /** Suma de (IMP_BRUTO - IMP_DESCUENTO) de las partidas. 0 si no hay partidas. */
  totalPartidas: number;
  /** impBruto - totalPartidas. Positivo: faltan; negativo: excede. */
  diferencia: number;
  /** Código de cuadre (columna "Cuadre"). */
  cveCuadre: CuadreCxp;
  /** Situación para mostrar (columna "Situación"). */
  situacion: SituacionCxp;
  /** 1 = la cuenta admite cambios (activa y sin conciliar); 0 = solo lectura. */
  bEditable: 0 | 1;
}

/** Contenido de data[0]. */
export interface DatosGridCxp {
  /** Cuentas que cumplen los filtros, ordenadas por folio descendente. null si no hay ninguna. */
  cuentas: CuentaGridCxp[] | null;
}

/** I_InfResponse estándar de la API, tipado para este servicio. */
export interface RespuestaGridCxp {
  estatus: number;
  /** El JSON del query llega envuelto en un arreglo: usar data[0].cuentas. */
  data: [DatosGridCxp] | null;
  errorUs: string | null;
  errorNeg: string[] | null;
}

// ------------------------------------------------------------------
// Ayudas para presentar el grid
// ------------------------------------------------------------------

/** Lista de cuentas lista para el grid ([] si no hay resultados). */
export const cuentasDeRespuesta = (r: RespuestaGridCxp): CuentaGridCxp[] =>
  r.data?.[0]?.cuentas ?? [];

/** Texto de la columna "Cuadre". */
export const textoCuadre = (c: CuentaGridCxp, fmtMoneda: (n: number) => string): string => {
  switch (c.cveCuadre) {
    case 'CU': return 'Cuadra';
    case 'FA': return `Faltan ${fmtMoneda(c.diferencia)}`;
    case 'EX': return `Excede por ${fmtMoneda(Math.abs(c.diferencia))}`;
    default:   return 'Sin partidas';
  }
};

// ------------------------------------------------------------------
// Ejemplo
// ------------------------------------------------------------------
//
// Petición (carga inicial: mes en curso, todos los proveedores, activas):
// {
//   "idProceso": 2,
//   "idQuery": <ID_QUERY_GRID_CXP>,
//   "parmRemp": { "$1": "XXXX", "$2": "202610", "$3": 0, "$4": "A" }
// }
//
// Respuesta:
// {
//   "estatus": 1,
//   "data": [{
//     "cuentas": [{
//       "uuid": "00000000-0000-4000-8000-000000990002",
//       "idConciliaCxp": 990002,
//       "fOperacion": "2026-10-02",
//       "idProveedor": 7,
//       "nomProveedor": "Proveedor 7, S.A. de C.V.",
//       "impBruto": 42000.00,
//       "numPartidas": 1,
//       "totalPartidas": 30000.00,
//       "diferencia": 12000.00,
//       "cveCuadre": "FA",
//       "situacion": "Activa",
//       "bEditable": 1
//     }]
//   }],
//   "errorUs": null,
//   "errorNeg": null
// }
