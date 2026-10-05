// ==================================================================
// Lógica manual de CI_CUENTA_X_PAGAR.
// Este archivo NO se regenera: el generador solo lo crea si no existe.
// El tipo ManualCI_CUENTA_X_PAGAR (en CI_CUENTA_X_PAGAR.gen.ts) exige
// una función en `asignar` por cada campo con MANUAL=SI en
// specs/ADCONDOM/CI_CUENTA_X_PAGAR.csv; si falta o sobra una, no compila.
// ==================================================================
import type { ManualCI_CUENTA_X_PAGAR } from './CI_CUENTA_X_PAGAR.gen.js';
import type { I_Header } from '@modelos/index.js';
import { obtenFolio, creaHeadEsq } from '@util/index.js';
import { userContext } from '@middle/index.js';

const kFolioCxp = 'CXP';
const kAplicacion = 'CONDOM';   // solo si no hay header en el contexto de la petición

export const manual: ManualCI_CUENTA_X_PAGAR = {

  // Solo en inserción: se ejecutan después de los DEFAULT y antes de validar.
  // options.transaction trae la transacción de la operación.
  asignar: {
    // Folio del sistema: siempre se asigna, aunque el cliente envíe un valor.
    // Se obtiene fuera de la transacción: si la inserción falla, el folio se pierde (huecos aceptados).
    ID_CONCILIA_CXP: async (instance) => {
      const header = (userContext.getStore() as I_Header) ?? creaHeadEsq(kAplicacion);
      const folio = Number(await obtenFolio(kFolioCxp, header));
      if (!Number.isSafeInteger(folio) || folio <= 0) {
        // Error de sistema (no de captura): ejecFuncion lo registra como excepción
        throw new Error(`No se pudo obtener el folio ${kFolioCxp} para ID_CONCILIA_CXP`);
      }
      instance.ID_CONCILIA_CXP = folio;
    },
  },

  // Reglas de negocio adicionales; se ejecutan después de las generadas.
  reglas: [],
};
