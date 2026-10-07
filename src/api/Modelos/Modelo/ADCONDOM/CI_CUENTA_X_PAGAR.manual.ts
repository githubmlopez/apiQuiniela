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
    // Importe neto calculado por el back (no se captura): IMP_BRUTO + IMP_IVA
    IMP_NETO: (instance) => {
      instance.IMP_NETO = calcularNeto(instance);
    },

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

  // Solo en actualización, sobre el registro real (después de revisar los no editables).
  // Cancelación: al pasar SIT_C_X_P a 'C' se registra la fecha (F_CANCELACION no la envía el cliente).
  // Importe neto: se recalcula si cambia alguno de los importes que lo componen.
  alActualizar: (instance) => {
    if (instance.changed('IMP_BRUTO') || instance.changed('IMP_IVA')) {
      instance.IMP_NETO = calcularNeto(instance);
    }
    if (instance.changed('SIT_C_X_P') && instance.SIT_C_X_P === 'C') {
      instance.F_CANCELACION = new Date().toLocaleDateString('en-CA');   // hoy, YYYY-MM-DD local
    }
  },

  // Reglas de negocio adicionales; se ejecutan después de las generadas.
  reglas: [
    // Una cuenta cancelada o conciliada no admite modificaciones (incluida otra cancelación).
    // Se usa previous(): el valor de la BD, no el enviado (al cancelar, SIT_C_X_P ya trae 'C').
    // Las conciliaciones se hacen por SP y no pasan por este hook.
    {
      campo: 'SIT_C_X_P',
      label: 'Sit CxP',
      exec: (inst: any, campo: string) => {
        if (inst.isNewRecord) return null;   // solo aplica a modificaciones
        if (inst.previous('SIT_C_X_P') === 'C') {
          return { campo, mensaje: '[N]: La cuenta por pagar está cancelada y no admite modificaciones' };
        }
        if (inst.previous('SIT_CONCILIA_CXP') !== 'NC') {
          return { campo, mensaje: '[N]: La cuenta por pagar ya fue conciliada y no admite modificaciones' };
        }
        return null;
      },
      // Se evalúa en todo intento de modificación, aunque los valores enviados sean iguales a los de la BD.
      // (En la validación preliminar del update la instancia es nueva y la condición de arriba la omite.)
      siempre: true,
    },

    // Cancelación: el único cambio de situación permitido es A → C, y va sola (sin otros cambios).
    {
      campo: 'SIT_C_X_P',
      label: 'Sit CxP',
      exec: (inst: any, campo: string) => {
        if (inst.isNewRecord) return null;
        if (inst.previous('SIT_C_X_P') !== 'A' || inst.SIT_C_X_P !== 'C') {
          return { campo, mensaje: '[N]: Solo se permite cancelar la cuenta por pagar (situación A → C)' };
        }
        const otros = (inst.changed() || []).filter((c: string) => c !== 'SIT_C_X_P' && c !== 'F_CANCELACION');
        if (otros.length > 0) {
          return { campo, mensaje: '[N]: La cancelación no puede incluir otros cambios' };
        }
        return null;
      },
    },
  ],
};

/**
 * Importe neto de la cuenta: IMP_BRUTO + IMP_IVA, redondeado a 2 decimales.
 * Regresa null si falta alguno de los importes (sus validaciones de obligatorio lo reportan).
 * Cuando se capturen IEPS, impuestos locales y retenciones, la fórmula se amplía aquí.
 */
function calcularNeto(instance: any): number | null {
  const valor = (v: any) => (v === null || v === undefined || v === '' ? null : Number(v));
  const bruto = valor(instance.IMP_BRUTO);
  const iva = valor(instance.IMP_IVA);
  if (bruto === null || iva === null || Number.isNaN(bruto) || Number.isNaN(iva)) return null;
  return Math.round((bruto + iva) * 100) / 100;
}
