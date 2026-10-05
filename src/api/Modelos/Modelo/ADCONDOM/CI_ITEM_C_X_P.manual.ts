// ==================================================================
// Lógica manual de CI_ITEM_C_X_P.
// Este archivo NO se regenera: el generador solo lo crea si no existe.
// El tipo ManualCI_ITEM_C_X_P (en CI_ITEM_C_X_P.gen.ts) exige
// una función en `asignar` por cada campo con MANUAL=SI en
// specs/ADCONDOM/CI_ITEM_C_X_P.csv; si falta o sobra una, no compila.
// ==================================================================
import type { ManualCI_ITEM_C_X_P } from './CI_ITEM_C_X_P.gen.js';
import type { I_Header } from '@modelos/index.js';
import { obtenFolio, creaHeadEsq } from '@util/index.js';
import { userContext } from '@middle/index.js';

const kFolioItemCxp = 'CXPI';
const kAplicacion = 'CONDOM';   // solo si no hay header en el contexto de la petición

export const manual: ManualCI_ITEM_C_X_P = {

  // Solo en inserción: se ejecutan después de los DEFAULT y antes de validar.
  // options.transaction trae la transacción de la operación.
  asignar: {
    // Folio del sistema: siempre se asigna, aunque el cliente envíe un valor.
    // Se obtiene fuera de la transacción: si la inserción falla, el folio se pierde (huecos aceptados).
    ID_CXP_DET: async (instance) => {
      const header = (userContext.getStore() as I_Header) ?? creaHeadEsq(kAplicacion);
      const folio = Number(await obtenFolio(kFolioItemCxp, header));
      if (!Number.isSafeInteger(folio) || folio <= 0) {
        // Error de sistema (no de captura): ejecFuncion lo registra como excepción
        throw new Error(`No se pudo obtener el folio ${kFolioItemCxp} para ID_CXP_DET`);
      }
      instance.ID_CXP_DET = folio;
    },

    // Inicialmente es la operación capturada; el SP del proceso puede cambiarla después
    CVE_OPER_ASIG: (instance) => {
      instance.CVE_OPER_ASIG = instance.CVE_OPERACION;
    },
  },

  // Solo en actualización, sobre el registro real (después de revisar los no editables).
  // CVE_OPER_ASIG sigue a CVE_OPERACION mientras el proceso no la haya cambiado:
  // si todavía es igual a la operación anterior, se actualiza; si no, se respeta.
  alActualizar: (instance) => {
    if (instance.changed('CVE_OPERACION') &&
        instance.CVE_OPER_ASIG === instance.previous('CVE_OPERACION')) {
      instance.CVE_OPER_ASIG = instance.CVE_OPERACION;
    }
  },

  // Reglas de negocio adicionales; se ejecutan después de las generadas.
  reglas: [],
};
