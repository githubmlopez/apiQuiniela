// ==================================================================
// Contrato: Detalle de una Cuenta por Pagar (encabezado + partidas)
// Servicio:  POST /api/Query/Consulta
// Query:     catálogo de queries, id pendiente de asignar (ID_QUERY_DETALLE_CXP)
//
// Se llama al seleccionar una cuenta en el grid (CxpGrid.ts) y trae todo lo
// necesario para mostrarla y editarla.
// ==================================================================

import type { CuadreCxp, SituacionCxp } from './CxpGrid.js';

/** Id del query en el catálogo. Pendiente de asignar al registrarlo. */
export const ID_QUERY_DETALLE_CXP = 0;

// ------------------------------------------------------------------
// Petición
// ------------------------------------------------------------------

export interface ParamsDetalleCxp {
  /** Clave de empresa (CVE_EMPRESA). Obligatorio. */
  $1: string;
  /** UUID de la cuenta (el campo `uuid` del renglón del grid). Obligatorio. */
  $2: string;
}

export interface PeticionDetalleCxp {
  idProceso: number;
  idQuery: number;
  parmRemp: ParamsDetalleCxp;
}

// ------------------------------------------------------------------
// Respuesta
// ------------------------------------------------------------------

/** Forma de pago. */
export type FormaPagoCxp =
  | 'T'   // Transferencia
  | 'E'   // Efectivo
  | 'C';  // Cheque

/** Moneda. */
export type MonedaCxp =
  | 'P'   // Pesos
  | 'D';  // Dólares

/** Encabezado de la cuenta (tabla CI_CUENTA_X_PAGAR). */
export interface EncabezadoCxp {
  /** Llave de la cuenta (junto con la empresa). No se modifica. */
  uuid: string;
  /** Folio de la cuenta. No se modifica. */
  idConciliaCxp: number;
  /** Fecha de operación, "AAAA-MM-DD". No se modifica. */
  fOperacion: string;
  /** Moneda: 'P' = Pesos, 'D' = Dólares. No se modifica. */
  cveMoneda: MonedaCxp;
  /** Proveedor. Editable. */
  idProveedor: number;
  /** Nombre del proveedor (solo para mostrar). Puede venir null. */
  nomProveedor: string | null;
  /** Forma de pago. Editable. */
  cveFormaPago: FormaPagoCxp;
  /** Importe bruto de la factura: total de control contra el que se cuadran las partidas. Editable. */
  impBruto: number;
  /** IVA. Editable. Debe ser menor o igual que impBruto. */
  impIva: number;
  /** impBruto + impIva. Lo calcula el back en el alta y al modificar bruto o IVA: NO se envía (se rechaza). */
  impNeto: number;
  /** Chequera ("PBMX1"). No se captura. */
  cveChequera: string;
  /** Nota, hasta 200 caracteres. Editable. Puede venir null. */
  txNota: string | null;
  /** Situación para mostrar. */
  situacion: SituacionCxp;
  /** 1 = la cuenta admite cambios (activa y sin conciliar); 0 = todo en solo lectura. */
  bEditable: 0 | 1;
  /** Código de cuadre (lo mantiene la base de datos; no se envía al guardar). */
  sitCuadre: CuadreCxp;
  /** Número de partidas registradas. */
  numPartidas: number;
  /** Suma de (impBruto - impDescuento) de las partidas. 0 si no hay partidas. */
  totalPartidas: number;
  /** impBruto - totalPartidas. Positivo: faltan; negativo: excede. */
  diferencia: number;
}

/** Una partida de la cuenta (tabla CI_ITEM_C_X_P). */
export interface PartidaCxp {
  /** Folio de la partida; llave junto con empresa y uuid. No se modifica. */
  idCxpDet: number;
  /** Clave de la operación (texto, p. ej. "05"). Editable. */
  cveOperacion: string;
  /** Descripción de la operación (solo para mostrar). Puede venir null. */
  descOperacion: string | null;
  /** Importe bruto de la partida. Editable. */
  impBruto: number;
  /** Descuento. Editable. Debe ser menor o igual que impBruto. */
  impDescuento: number;
  /** impBruto - impDescuento. Se calcula; no se captura. */
  importe: number;
  /** Nota, hasta 200 caracteres. Editable. Puede venir null. */
  txNota: string | null;
  /** Operación asignada por el proceso de la CxP (no se muestra ni se envía). */
  cveOperAsig: string;
}

/** Contenido de data[0]. */
export interface DatosDetalleCxp {
  /** null si la cuenta no existe (por ejemplo, la eliminaron después de cargar el grid). */
  encabezado: EncabezadoCxp | null;
  /** Partidas ordenadas por folio. null si la cuenta no tiene partidas. */
  partidas: PartidaCxp[] | null;
}

/** I_InfResponse estándar de la API, tipado para este servicio. */
export interface RespuestaDetalleCxp {
  estatus: number;
  /** El JSON del query llega envuelto en un arreglo: usar data[0].encabezado y data[0].partidas. */
  data: [DatosDetalleCxp] | null;
  errorUs: string | null;
  errorNeg: string[] | null;
}

// ------------------------------------------------------------------
// Ayudas
// ------------------------------------------------------------------

/** Encabezado de la respuesta, o null si la cuenta no existe. */
export const encabezadoDeRespuesta = (r: RespuestaDetalleCxp): EncabezadoCxp | null =>
  r.data?.[0]?.encabezado ?? null;

/** Partidas de la respuesta ([] si no hay). */
export const partidasDeRespuesta = (r: RespuestaDetalleCxp): PartidaCxp[] =>
  r.data?.[0]?.partidas ?? [];

// ------------------------------------------------------------------
// Guardado (/api/Crud/Crea, /api/Crud/Modifica, /api/Crud/Borra)
//
// El guardado usa los nombres de columna de la base de datos. En una
// modificación se envía la llave y SOLO los campos que el usuario cambió.
// ------------------------------------------------------------------

export const MODELO_ENCABEZADO_CXP = 'CI_CUENTA_X_PAGAR';
export const MODELO_PARTIDA_CXP = 'CI_ITEM_C_X_P';

/** Campos del encabezado que se pueden modificar y su columna en la base de datos. */
export const COLUMNAS_EDITABLES_ENCABEZADO = {
  idProveedor: 'ID_PROVEEDOR',
  cveFormaPago: 'CVE_FORMA_PAGO',
  impBruto: 'IMP_BRUTO',
  impIva: 'IMP_IVA',
  txNota: 'TX_NOTA',
} as const;

/** Campos de la partida que se pueden modificar y su columna en la base de datos. */
export const COLUMNAS_EDITABLES_PARTIDA = {
  cveOperacion: 'CVE_OPERACION',
  impBruto: 'IMP_BRUTO',
  impDescuento: 'IMP_DESCUENTO',
  txNota: 'TX_NOTA',
} as const;

// Llaves:
//   Encabezado: { CVE_EMPRESA, UUID }
//   Partida:    { CVE_EMPRESA, UUID, ID_CXP_DET }
//
// Ejemplo de modificación de una partida:
// {
//   "idProceso": 1,
//   "model": "CI_ITEM_C_X_P",
//   "data": { "CVE_EMPRESA": "XXXX", "UUID": "<uuid>", "ID_CXP_DET": 990101, "CVE_OPERACION": "12" }
// }
//
// La baja del encabezado NO usa /api/Crud/Borra: es una CANCELACIÓN por /api/Crud/Modifica,
// enviando la llave y únicamente SIT_C_X_P = 'C' (solo si bEditable = 1):
// {
//   "idProceso": 5,
//   "model": "CI_CUENTA_X_PAGAR",
//   "data": { "CVE_EMPRESA": "XXXX", "UUID": "<uuid>", "SIT_C_X_P": "C" }
// }
// El back registra F_CANCELACION con la fecha del día. Una cuenta cancelada no se puede reactivar,
// una conciliada no se puede cancelar, y la cancelación no puede llevar otros cambios en la misma petición.

// ------------------------------------------------------------------
// Ejemplo
// ------------------------------------------------------------------
//
// Petición:
// {
//   "idProceso": 2,
//   "idQuery": <ID_QUERY_DETALLE_CXP>,
//   "parmRemp": { "$1": "XXXX", "$2": "00000000-0000-4000-8000-000000990001" }
// }
//
// Respuesta:
// {
//   "estatus": 1,
//   "data": [{
//     "encabezado": {
//       "uuid": "00000000-0000-4000-8000-000000990001",
//       "idConciliaCxp": 990001,
//       "fOperacion": "2026-10-01",
//       "cveMoneda": "P",
//       "idProveedor": 3,
//       "nomProveedor": "Proveedor 3, S.A. de C.V.",
//       "cveFormaPago": "T",
//       "impBruto": 18000.00,
//       "impIva": 2880.00,
//       "impNeto": 20880.00,
//       "cveChequera": "PBMX1",
//       "txNota": "Servicio mensual de octubre",
//       "situacion": "Activa",
//       "bEditable": 1,
//       "sitCuadre": "CU",
//       "numPartidas": 2,
//       "totalPartidas": 18000.00,
//       "diferencia": 0.00
//     },
//     "partidas": [
//       { "idCxpDet": 990101, "cveOperacion": "01", "descOperacion": "Mantenimiento", "impBruto": 15000.00,
//         "impDescuento": 0.00, "importe": 15000.00, "txNota": "Servicio mensual", "cveOperAsig": "01" },
//       { "idCxpDet": 990102, "cveOperacion": "05", "descOperacion": "Limpieza", "impBruto": 3000.00,
//         "impDescuento": 0.00, "importe": 3000.00, "txNota": "Servicio extra", "cveOperAsig": "05" }
//     ]
//   }],
//   "errorUs": null,
//   "errorNeg": null
// }
