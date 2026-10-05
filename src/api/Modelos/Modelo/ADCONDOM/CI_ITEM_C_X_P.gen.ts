// ==================================================================
// ARCHIVO GENERADO — NO EDITAR: se sobrescribe completo al regenerar.
// Fuente:   specs/ADCONDOM/CI_ITEM_C_X_P.json (definición)
//           specs/ADCONDOM/CI_ITEM_C_X_P.csv  (hooks)
// Generar:  /generar-modelo ADCONDOM/CI_ITEM_C_X_P
// Lógica manual: CI_ITEM_C_X_P.manual.ts
// ==================================================================
import {construirErroresValidacion} from
'@router/index.js';
import {validators, runValidationEngine } from
  '@util/index.js';
import type {ValidationRule} from
  '@util/index.js';
import { manual } from './CI_ITEM_C_X_P.manual.js';

// --- Contrato con CI_ITEM_C_X_P.manual.ts ---
// Una función por cada campo con MANUAL=SI en el CSV
export type CamposManualesCI_ITEM_C_X_P = 'ID_CXP_DET' | 'CVE_OPER_ASIG';

export interface ManualCI_ITEM_C_X_P {
  /** Solo en inserción: después de los DEFAULT y antes de validar. */
  asignar: Record<CamposManualesCI_ITEM_C_X_P, (instance: any, options: any) => void | Promise<void>>;
  /** Solo en actualización: sobre el registro real, después de revisar los no editables y antes de validar. */
  alActualizar?: (instance: any, options: any) => void | Promise<void>;
  /** Reglas adicionales; se ejecutan después de las generadas. */
  reglas?: ValidationRule[];
}

// --- Codigo generado de manera automatica -----
import { DataTypes } from 'sequelize'

export async function def_CI_ITEM_C_X_P(sequelize: any) {
   // La constante se define porque es necesaria en HOOKS
   const CI_ITEM_C_X_P = sequelize.define(
   'CI_ITEM_C_X_P',
   {
      CVE_EMPRESA : {
         type: DataTypes.STRING (4),
         allowNull: false,
         primaryKey: true
      },
      UUID : {
         type: DataTypes.STRING (36),
         allowNull: false,
         primaryKey: true
      },
      ID_CXP_DET : {
         type: DataTypes.INTEGER  ,
         allowNull: false,
         primaryKey: true
      },
      CVE_OPERACION : {
         type: DataTypes.STRING (4),
         allowNull: false,
      },
      IMP_BRUTO : {
         type: DataTypes.DECIMAL (12, 2),
         allowNull: false,
      },
      TX_NOTA : {
         type: DataTypes.STRING (200),
         allowNull: true,
      },
      IMP_DESCUENTO : {
         type: DataTypes.DECIMAL (12, 2),
         allowNull: false,
      },
      IMP_DEDUCIBLE : {
         type: DataTypes.DECIMAL (12, 2),
         allowNull: false,
      },
      IMP_DEDUC_CAL : {
         type: DataTypes.DECIMAL (12, 2),
         allowNull: false,
      },
      CVE_OPER_ASIG : {
         type: DataTypes.STRING (4),
         allowNull: false,
      },
   },
   {
      modelName: 'CI_ITEM_C_X_P',
      tableName: 'CI_ITEM_C_X_P',
      schema: 'dbo',
      timestamps: false,
      hasTriggers: true,  // PROPIEDAD PERSONALIZADA : NO AFECTA A SEQUELIZE
      indexes: [ {
         name : 'PK_CI_DET_CTA_X_PAGAR',
         unique : true,
         fields : [
                'CVE_EMPRESA',
                'UUID',
                'ID_CXP_DET',
         ]
      }
      ]
   }
   );

// ----------------------------------------------

// ============================================
// 🧩 Hook BEFORE VALIDATE para CI_ITEM_C_X_P
// ============================================
CI_ITEM_C_X_P.addHook('beforeValidate', async (instance: any, options: any) => {

  // En Model.update (updateRecord) Sequelize valida una instancia construida solo con los
  // datos enviados (con isNewRecord = true): no es inserción y solo se validan esos campos.
  // La validación completa del update se hace en beforeUpdate, con el registro real.
  const esUpdateParcial = options.type === 'BULKUPDATE';

  // --- 1) Asignación de valores (solo en inserción) ---
  // Se asignan aquí y no en beforeCreate: Sequelize valida allowNull
  // antes de ejecutar beforeCreate.
  if (instance.isNewRecord && !esUpdateParcial) {
    if (instance.IMP_DESCUENTO == null) instance.IMP_DESCUENTO = 0;
    if (instance.IMP_DEDUCIBLE == null) instance.IMP_DEDUCIBLE = 0;
    if (instance.IMP_DEDUC_CAL == null) instance.IMP_DEDUC_CAL = 0;

    // Campos MANUAL (CI_ITEM_C_X_P.manual.ts)
    await manual.asignar.ID_CXP_DET(instance, options);
    await manual.asignar.CVE_OPER_ASIG(instance, options);
  }

  // --- 2) Validaciones: generadas + manuales ---
  await runValidationEngine(instance, reglas, construirErroresValidacion,
    esUpdateParcial ? { ...options, validateOnlyChanged: true, sinDependencias: true } : options);

});

// ============================================
// 🧩 Hook BEFORE UPDATE para CI_ITEM_C_X_P
// ============================================
// instance es el registro de la BD con los cambios aplicados: changed() compara contra la BD.
// Requiere individualHooks: true en Model.update (updateRecord lo envía).
CI_ITEM_C_X_P.addHook('beforeUpdate', async (instance: any, options: any) => {

  // --- 1) Campos no editables (antes de alActualizar, para no marcar sus propios ajustes) ---
  const errores = noEditables
    .filter(c => instance.changed(c.campo))
    .map(c => ({ campo: c.campo, mensaje: `[N]: El campo ${c.label} no se puede modificar` }));

  if (errores.length > 0) {
    throw construirErroresValidacion(errores, instance);
  }

  // --- 2) Ajustes manuales (CI_ITEM_C_X_P.manual.ts) ---
  await manual.alActualizar?.(instance, options);

  // --- 3) Validaciones de lo que cambió, incluidas sus dependencias ---
  await runValidationEngine(instance, reglas, construirErroresValidacion,
    { ...options, validateOnlyChanged: true });
});

   return CI_ITEM_C_X_P;
}

// ============================================
// Definiciones usadas por los hooks (se crean una sola vez al cargar el módulo)
// ============================================

// Validaciones: obligatorio → tipo → VALIDACIONES del CSV
const reglasGeneradas: ValidationRule[] = [
  // 1. CVE_EMPRESA: Obligatorio, varchar(4)
  {
    campo: 'CVE_EMPRESA',
    label: 'Cve Empresa',
    exec: (inst : any, campo, label) =>
      validators.isNotNull(inst.CVE_EMPRESA, campo, label) ||
      validators.length(inst.CVE_EMPRESA, 1, 4, campo, label)
  },

  // 2. UUID: Obligatorio, varchar(36)
  {
    campo: 'UUID',
    label: 'UUID',
    exec: (inst : any, campo, label) =>
      validators.isNotNull(inst.UUID, campo, label) ||
      validators.length(inst.UUID, 1, 36, campo, label)
  },

  // 3. ID_CXP_DET: Obligatorio, int
  {
    campo: 'ID_CXP_DET',
    label: 'Id Item CxP',
    exec: (inst : any, campo, label) =>
      validators.isNotNull(inst.ID_CXP_DET, campo, label) ||
      validators.isIntType(inst.ID_CXP_DET, 'int', campo, label)
  },

  // 4. CVE_OPERACION: Obligatorio, varchar(4)
  {
    campo: 'CVE_OPERACION',
    label: 'Cve Operación',
    exec: (inst : any, campo, label) =>
      validators.isNotNull(inst.CVE_OPERACION, campo, label) ||
      validators.length(inst.CVE_OPERACION, 1, 4, campo, label)
  },

  // 5. IMP_BRUTO: Obligatorio, numeric(12,2)
  {
    campo: 'IMP_BRUTO',
    label: 'Imp Bruto',
    exec: (inst : any, campo, label) =>
      validators.isNotNull(inst.IMP_BRUTO, campo, label) ||
      validators.isDecimalScale(inst.IMP_BRUTO, 12, 2, campo, label) ||
      validators.isNonNegative(inst.IMP_BRUTO, campo, label)
  },

  // 6. TX_NOTA: Opcional, varchar(200)
  {
    campo: 'TX_NOTA',
    label: 'Nota',
    exec: (inst : any, campo, label) => validators.length(inst.TX_NOTA, 0, 200, campo, label)
  },

  // 7. IMP_DESCUENTO: Obligatorio, numeric(12,2)
  {
    campo: 'IMP_DESCUENTO',
    label: 'Imp Descuento',
    exec: (inst : any, campo, label) =>
      validators.isNotNull(inst.IMP_DESCUENTO, campo, label) ||
      validators.isDecimalScale(inst.IMP_DESCUENTO, 12, 2, campo, label) ||
      validators.isNonNegative(inst.IMP_DESCUENTO, campo, label) ||
      validators.compareField(inst.IMP_DESCUENTO, '<=', inst.IMP_BRUTO, campo, label, 'Imp Bruto'),
    dependencias: ['IMP_BRUTO']
  },

  // 8. IMP_DEDUCIBLE: Obligatorio, numeric(12,2)
  {
    campo: 'IMP_DEDUCIBLE',
    label: 'Imp Deducible',
    exec: (inst : any, campo, label) =>
      validators.isNotNull(inst.IMP_DEDUCIBLE, campo, label) ||
      validators.isDecimalScale(inst.IMP_DEDUCIBLE, 12, 2, campo, label) ||
      validators.isNonNegative(inst.IMP_DEDUCIBLE, campo, label) ||
      validators.compareField(inst.IMP_DEDUCIBLE, '<=', inst.IMP_BRUTO, campo, label, 'Imp Bruto'),
    dependencias: ['IMP_BRUTO']
  },

  // 9. IMP_DEDUC_CAL: Obligatorio, numeric(12,2)
  {
    campo: 'IMP_DEDUC_CAL',
    label: 'Imp Deduc Cal',
    exec: (inst : any, campo, label) =>
      validators.isNotNull(inst.IMP_DEDUC_CAL, campo, label) ||
      validators.isDecimalScale(inst.IMP_DEDUC_CAL, 12, 2, campo, label) ||
      validators.isNonNegative(inst.IMP_DEDUC_CAL, campo, label)
  },

  // 10. CVE_OPER_ASIG: Obligatorio, varchar(4)
  {
    campo: 'CVE_OPER_ASIG',
    label: 'Cve Opera Asig',
    exec: (inst : any, campo, label) =>
      validators.isNotNull(inst.CVE_OPER_ASIG, campo, label) ||
      validators.length(inst.CVE_OPER_ASIG, 1, 4, campo, label)
  },
];

// Reglas que ejecuta el motor: generadas + las del archivo manual
const reglas: ValidationRule[] = [...reglasGeneradas, ...(manual.reglas ?? [])];

// Campos que no se pueden modificar una vez creado el registro (EDITABLE=NO y PK)
const noEditables = [
  { campo: 'CVE_EMPRESA', label: 'Cve Empresa' },
  { campo: 'UUID', label: 'UUID' },
  { campo: 'ID_CXP_DET', label: 'Id Item CxP' },
  { campo: 'IMP_DEDUCIBLE', label: 'Imp Deducible' },
  { campo: 'IMP_DEDUC_CAL', label: 'Imp Deduc Cal' },
  { campo: 'CVE_OPER_ASIG', label: 'Cve Opera Asig' },
];
