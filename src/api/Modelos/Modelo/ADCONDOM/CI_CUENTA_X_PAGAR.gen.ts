// ==================================================================
// ARCHIVO GENERADO — NO EDITAR: se sobrescribe completo al regenerar.
// Fuente:   specs/ADCONDOM/CI_CUENTA_X_PAGAR.json (definición)
//           specs/ADCONDOM/CI_CUENTA_X_PAGAR.csv  (hooks)
// Generar:  /generar-modelo ADCONDOM/CI_CUENTA_X_PAGAR
// Lógica manual: CI_CUENTA_X_PAGAR.manual.ts
// ==================================================================
import {construirErroresValidacion} from
'@router/index.js';
import {validators, runValidationEngine } from
  '@util/index.js';
import type {ValidationRule} from
  '@util/index.js';
import { randomUUID } from 'node:crypto';
import { manual } from './CI_CUENTA_X_PAGAR.manual.js';

// --- Contrato con CI_CUENTA_X_PAGAR.manual.ts ---
// Una función por cada campo con MANUAL=SI en el CSV
export type CamposManualesCI_CUENTA_X_PAGAR = 'ID_CONCILIA_CXP';

export interface ManualCI_CUENTA_X_PAGAR {
  /** Solo en inserción: después de los DEFAULT y antes de validar. */
  asignar: Record<CamposManualesCI_CUENTA_X_PAGAR, (instance: any, options: any) => void | Promise<void>>;
  /** Solo en actualización: sobre el registro real, después de revisar los no editables y antes de validar. */
  alActualizar?: (instance: any, options: any) => void | Promise<void>;
  /** Reglas adicionales; se ejecutan después de las generadas. */
  reglas?: ValidationRule[];
}

// --- Codigo generado de manera automatica -----
import { DataTypes } from 'sequelize'

export async function def_CI_CUENTA_X_PAGAR(sequelize: any) {
   // La constante se define porque es necesaria en HOOKS
   const CI_CUENTA_X_PAGAR = sequelize.define(
   'CI_CUENTA_X_PAGAR',
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
      ID_PROVEEDOR : {
         type: DataTypes.INTEGER  ,
         allowNull: false,
      },
      CVE_CHEQUERA : {
         type: DataTypes.STRING (6),
         allowNull: false,
      },
      CVE_TIPO_FACTURA : {
         type: DataTypes.STRING (6),
         allowNull: false,
      },
      F_OPERACION : {
         type: DataTypes.DATEONLY  ,
         allowNull: false,
      },
      F_CAPTURA : {
         type: DataTypes.DATEONLY  ,
         allowNull: false,
      },
      F_CANCELACION : {
         type: DataTypes.DATEONLY  ,
         allowNull: true,
      },
      F_PAGO : {
         type: DataTypes.DATEONLY  ,
         allowNull: true,
      },
      IMP_BRUTO : {
         type: DataTypes.DECIMAL (12, 2),
         allowNull: false,
      },
      IMP_IVA : {
         type: DataTypes.DECIMAL (12, 2),
         allowNull: false,
      },
      IMP_NETO : {
         type: DataTypes.DECIMAL (12, 2),
         allowNull: false,
      },
      CVE_MONEDA : {
         type: DataTypes.STRING (1),
         allowNull: false,
      },
      TIPO_CAMBIO : {
         type: DataTypes.DECIMAL (8, 2),
         allowNull: true,
      },
      CVE_FORMA_PAGO : {
         type: DataTypes.STRING (1),
         allowNull: false,
      },
      NUM_CHEQUE : {
         type: DataTypes.DECIMAL (6, 0),
         allowNull: true,
      },
      NUM_DOCTO_REF : {
         type: DataTypes.STRING (40),
         allowNull: true,
      },
      REFER_PAGO : {
         type: DataTypes.STRING (70),
         allowNull: true,
      },
      TX_NOTA : {
         type: DataTypes.STRING (200),
         allowNull: true,
      },
      NOMBRE_DOCTO_PDF : {
         type: DataTypes.STRING (25),
         allowNull: true,
      },
      NOMBRE_DOCTO_XML : {
         type: DataTypes.STRING (25),
         allowNull: true,
      },
      ID_CONCILIA_CXP : {
         type: DataTypes.INTEGER  ,
         allowNull: false,
         unique: true,
      },
      SIT_CONCILIA_CXP : {
         type: DataTypes.STRING (2),
         allowNull: false,
      },
      SIT_C_X_P : {
         type: DataTypes.STRING (2),
         allowNull: false,
      },
      CVE_MOT_CONCIL : {
         type: DataTypes.STRING (2),
         allowNull: true,
      },
      SERIE_PROV : {
         type: DataTypes.STRING (20),
         allowNull: true,
      },
      FOLIO_PROV : {
         type: DataTypes.STRING (40),
         allowNull: true,
      },
      ANOMES_CONT : {
         type: DataTypes.STRING (6),
         allowNull: true,
      },
      ANO_MES_PAGO : {
         type: DataTypes.STRING (6),
         allowNull: true,
      },
      ANO_MES : {
         type: DataTypes.STRING (6),
         allowNull: false,
      },
      IMP_ISR_RET : {
         type: DataTypes.DECIMAL (12, 2),
         allowNull: false,
      },
      IMP_IVA_RET : {
         type: DataTypes.DECIMAL (12, 2),
         allowNull: false,
      },
      IMP_IEPS : {
         type: DataTypes.DECIMAL (12, 2),
         allowNull: false,
      },
      IMP_LOCAL : {
         type: DataTypes.DECIMAL (12, 2),
         allowNull: false,
      },
      F_LIMIT_PAGO : {
         type: DataTypes.DATEONLY  ,
         allowNull: true,
      },
   },
   {
      modelName: 'CI_CUENTA_X_PAGAR',
      tableName: 'CI_CUENTA_X_PAGAR',
      schema: 'dbo',
      timestamps: false,
      hasTriggers: false,  // PROPIEDAD PERSONALIZADA : NO AFECTA A SEQUELIZE
      indexes: [ {
         name : 'PK_CI_CUENTA_X_PAGAR',
         unique : true,
         fields : [
                'CVE_EMPRESA',
                'UUID',
         ]
      },
      {
         name : 'IX_CI_CUENTA_X_PAGAR',
         unique : true,
         fields : [
                'ID_CONCILIA_CXP',
         ]
      }
      ]
   }
   );

// ----------------------------------------------

// ============================================
// 🧩 Hook BEFORE VALIDATE para CI_CUENTA_X_PAGAR
// ============================================
CI_CUENTA_X_PAGAR.addHook('beforeValidate', async (instance: any, options: any) => {

  // En Model.update (updateRecord) Sequelize valida una instancia construida solo con los
  // datos enviados (con isNewRecord = true): no es inserción y solo se validan esos campos.
  // La validación completa del update se hace en beforeUpdate, con el registro real.
  const esUpdateParcial = options.type === 'BULKUPDATE';

  // --- 1) Asignación de valores (solo en inserción) ---
  // Se asignan aquí y no en beforeCreate: Sequelize valida allowNull
  // antes de ejecutar beforeCreate.
  if (instance.isNewRecord && !esUpdateParcial) {
    if (!instance.UUID) instance.UUID = randomUUID();
    if (!instance.CVE_TIPO_FACTURA) instance.CVE_TIPO_FACTURA = 'CXP';
    if (!instance.F_CAPTURA) instance.F_CAPTURA = new Date().toLocaleDateString('en-CA'); // HOY (YYYY-MM-DD local)
    if (!instance.CVE_MONEDA) instance.CVE_MONEDA = 'P';
    if (instance.TIPO_CAMBIO == null) instance.TIPO_CAMBIO = 1;
    if (!instance.SIT_CONCILIA_CXP) instance.SIT_CONCILIA_CXP = 'NC';
    if (!instance.SIT_C_X_P) instance.SIT_C_X_P = 'A';
    if (instance.IMP_ISR_RET == null) instance.IMP_ISR_RET = 0;
    if (instance.IMP_IVA_RET == null) instance.IMP_IVA_RET = 0;
    if (instance.IMP_IEPS == null) instance.IMP_IEPS = 0;
    if (instance.IMP_LOCAL == null) instance.IMP_LOCAL = 0;

    // Dependen de otro campo
    if (!instance.ANO_MES) instance.ANO_MES = aAnioMes(instance.F_OPERACION); // ANIOMES(F_OPERACION)

    // Campos MANUAL (CI_CUENTA_X_PAGAR.manual.ts)
    await manual.asignar.ID_CONCILIA_CXP(instance, options);
  }

  // --- 2) Validaciones: generadas + manuales ---
  await runValidationEngine(instance, reglas, construirErroresValidacion,
    esUpdateParcial ? { ...options, validateOnlyChanged: true, sinDependencias: true } : options);

});

// ============================================
// 🧩 Hook BEFORE UPDATE para CI_CUENTA_X_PAGAR
// ============================================
// instance es el registro de la BD con los cambios aplicados: changed() compara contra la BD.
// Requiere individualHooks: true en Model.update (updateRecord lo envía).
CI_CUENTA_X_PAGAR.addHook('beforeUpdate', async (instance: any, options: any) => {

  // --- 1) Campos no editables (antes de alActualizar, para no marcar sus propios ajustes) ---
  const errores = noEditables
    .filter(c => instance.changed(c.campo))
    .map(c => ({ campo: c.campo, mensaje: `[N]: El campo ${c.label} no se puede modificar` }));

  if (errores.length > 0) {
    throw construirErroresValidacion(errores, instance);
  }

  // --- 2) Ajustes manuales (CI_CUENTA_X_PAGAR.manual.ts) ---
  await manual.alActualizar?.(instance, options);

  // --- 3) Validaciones de lo que cambió, incluidas sus dependencias ---
  await runValidationEngine(instance, reglas, construirErroresValidacion,
    { ...options, validateOnlyChanged: true });
});

   return CI_CUENTA_X_PAGAR;
}

// ============================================
// Definiciones usadas por los hooks (se crean una sola vez al cargar el módulo)
// ============================================

// Año-mes YYYYMM de una fecha (YYYY-MM-DD o Date); null si no es una fecha válida
const aAnioMes = (f: any): string | null => {
  if (!f || validators.isDateFormat(f, '') !== null) return null;
  const s = f instanceof Date ? f.toLocaleDateString('en-CA') : String(f);
  return s.slice(0, 4) + s.slice(5, 7);
};

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

  // 3. ID_PROVEEDOR: Obligatorio, int
  {
    campo: 'ID_PROVEEDOR',
    label: 'Cve Proveedor',
    exec: (inst : any, campo, label) =>
      validators.isNotNull(inst.ID_PROVEEDOR, campo, label) ||
      validators.isIntType(inst.ID_PROVEEDOR, 'int', campo, label)
  },

  // 4. CVE_CHEQUERA: Obligatorio, varchar(6)
  {
    campo: 'CVE_CHEQUERA',
    label: 'Cve Chequera',
    exec: (inst : any, campo, label) =>
      validators.isNotNull(inst.CVE_CHEQUERA, campo, label) ||
      validators.length(inst.CVE_CHEQUERA, 1, 6, campo, label)
  },

  // 5. CVE_TIPO_FACTURA: Obligatorio, varchar(6)
  {
    campo: 'CVE_TIPO_FACTURA',
    label: 'Tipo Factura',
    exec: (inst : any, campo, label) =>
      validators.isNotNull(inst.CVE_TIPO_FACTURA, campo, label) ||
      validators.length(inst.CVE_TIPO_FACTURA, 1, 6, campo, label)
  },

  // 6. F_OPERACION: Obligatorio, date
  {
    campo: 'F_OPERACION',
    label: 'F Operación',
    exec: (inst : any, campo, label) =>
      validators.isNotNull(inst.F_OPERACION, campo, label) ||
      validators.isDateFormat(inst.F_OPERACION, campo, label)
  },

  // 7. F_CAPTURA: Obligatorio, date
  {
    campo: 'F_CAPTURA',
    label: 'F Captura',
    exec: (inst : any, campo, label) =>
      validators.isNotNull(inst.F_CAPTURA, campo, label) ||
      validators.isDateFormat(inst.F_CAPTURA, campo, label)
  },

  // 8. F_CANCELACION: Opcional, date
  {
    campo: 'F_CANCELACION',
    label: 'F Cancelacion',
    exec: (inst : any, campo, label) => validators.isDateFormat(inst.F_CANCELACION, campo, label)
  },

  // 9. F_PAGO: Opcional, date
  {
    campo: 'F_PAGO',
    label: 'F Pago',
    exec: (inst : any, campo, label) => validators.isDateFormat(inst.F_PAGO, campo, label)
  },

  // 10. IMP_BRUTO: Obligatorio, numeric(12,2)
  {
    campo: 'IMP_BRUTO',
    label: 'Imp Bruto',
    exec: (inst : any, campo, label) =>
      validators.isNotNull(inst.IMP_BRUTO, campo, label) ||
      validators.isDecimalScale(inst.IMP_BRUTO, 12, 2, campo, label) ||
      validators.isNonNegative(inst.IMP_BRUTO, campo, label)
  },

  // 11. IMP_IVA: Obligatorio, numeric(12,2)
  {
    campo: 'IMP_IVA',
    label: 'Imp Iva',
    exec: (inst : any, campo, label) =>
      validators.isNotNull(inst.IMP_IVA, campo, label) ||
      validators.isDecimalScale(inst.IMP_IVA, 12, 2, campo, label) ||
      validators.isNonNegative(inst.IMP_IVA, campo, label) ||
      validators.compareField(inst.IMP_IVA, '<=', inst.IMP_BRUTO, campo, label, 'Imp Bruto'),
    dependencias: ['IMP_BRUTO']
  },

  // 12. IMP_NETO: Obligatorio, numeric(12,2)
  {
    campo: 'IMP_NETO',
    label: 'Imp Neto',
    exec: (inst : any, campo, label) =>
      validators.isNotNull(inst.IMP_NETO, campo, label) ||
      validators.isDecimalScale(inst.IMP_NETO, 12, 2, campo, label) ||
      validators.isPositive(inst.IMP_NETO, campo, label) ||
      validators.compareField(inst.IMP_NETO, '>=', inst.IMP_BRUTO, campo, label, 'Imp Bruto'),
    dependencias: ['IMP_BRUTO']
  },

  // 13. CVE_MONEDA: Obligatorio, varchar(1)
  {
    campo: 'CVE_MONEDA',
    label: 'Cve Moneda',
    exec: (inst : any, campo, label) =>
      validators.isNotNull(inst.CVE_MONEDA, campo, label) ||
      validators.length(inst.CVE_MONEDA, 1, 1, campo, label)
  },

  // 14. TIPO_CAMBIO: Opcional, numeric(8,2)
  {
    campo: 'TIPO_CAMBIO',
    label: 'Tipo Cambio',
    exec: (inst : any, campo, label) => validators.isDecimalScale(inst.TIPO_CAMBIO, 8, 2, campo, label)
  },

  // 15. CVE_FORMA_PAGO: Obligatorio, varchar(1)
  {
    campo: 'CVE_FORMA_PAGO',
    label: 'Forma Pago',
    exec: (inst : any, campo, label) =>
      validators.isNotNull(inst.CVE_FORMA_PAGO, campo, label) ||
      validators.length(inst.CVE_FORMA_PAGO, 1, 1, campo, label) ||
      validators.oneOf(inst.CVE_FORMA_PAGO, ['T', 'E', 'C'], campo, label)
  },

  // 16. NUM_CHEQUE: Opcional, numeric(6,0)
  {
    campo: 'NUM_CHEQUE',
    label: 'Num Cheque',
    exec: (inst : any, campo, label) => validators.integerLength(inst.NUM_CHEQUE, 6, campo, label)
  },

  // 17. NUM_DOCTO_REF: Opcional, varchar(40)
  {
    campo: 'NUM_DOCTO_REF',
    label: 'Docto Ref',
    exec: (inst : any, campo, label) => validators.length(inst.NUM_DOCTO_REF, 0, 40, campo, label)
  },

  // 18. REFER_PAGO: Opcional, varchar(70)
  {
    campo: 'REFER_PAGO',
    label: 'Ref Pago',
    exec: (inst : any, campo, label) => validators.length(inst.REFER_PAGO, 0, 70, campo, label)
  },

  // 19. TX_NOTA: Opcional, varchar(200)
  {
    campo: 'TX_NOTA',
    label: 'Nota',
    exec: (inst : any, campo, label) => validators.length(inst.TX_NOTA, 0, 200, campo, label)
  },

  // 20. NOMBRE_DOCTO_PDF: Opcional, varchar(25)
  {
    campo: 'NOMBRE_DOCTO_PDF',
    label: 'Docto PDF',
    exec: (inst : any, campo, label) => validators.length(inst.NOMBRE_DOCTO_PDF, 0, 25, campo, label)
  },

  // 21. NOMBRE_DOCTO_XML: Opcional, varchar(25)
  {
    campo: 'NOMBRE_DOCTO_XML',
    label: 'Docto xml',
    exec: (inst : any, campo, label) => validators.length(inst.NOMBRE_DOCTO_XML, 0, 25, campo, label)
  },

  // 22. ID_CONCILIA_CXP: Obligatorio, int
  {
    campo: 'ID_CONCILIA_CXP',
    label: 'Id Concilia',
    exec: (inst : any, campo, label) =>
      validators.isNotNull(inst.ID_CONCILIA_CXP, campo, label) ||
      validators.isIntType(inst.ID_CONCILIA_CXP, 'int', campo, label)
  },

  // 23. SIT_CONCILIA_CXP: Obligatorio, varchar(2)
  {
    campo: 'SIT_CONCILIA_CXP',
    label: 'Sit Concilia',
    exec: (inst : any, campo, label) =>
      validators.isNotNull(inst.SIT_CONCILIA_CXP, campo, label) ||
      validators.length(inst.SIT_CONCILIA_CXP, 1, 2, campo, label) ||
      validators.oneOf(inst.SIT_CONCILIA_CXP, ['CO', 'CC', 'NC'], campo, label)
  },

  // 24. SIT_C_X_P: Obligatorio, varchar(2)
  {
    campo: 'SIT_C_X_P',
    label: 'Sit CxP',
    exec: (inst : any, campo, label) =>
      validators.isNotNull(inst.SIT_C_X_P, campo, label) ||
      validators.length(inst.SIT_C_X_P, 1, 2, campo, label) ||
      validators.oneOf(inst.SIT_C_X_P, ['A', 'C'], campo, label)
  },

  // 25. CVE_MOT_CONCIL: Opcional, varchar(2)
  {
    campo: 'CVE_MOT_CONCIL',
    label: 'Mot Concilia',
    exec: (inst : any, campo, label) => validators.length(inst.CVE_MOT_CONCIL, 0, 2, campo, label)
  },

  // 26. SERIE_PROV: Opcional, varchar(20)
  {
    campo: 'SERIE_PROV',
    label: 'Serie Prov',
    exec: (inst : any, campo, label) => validators.length(inst.SERIE_PROV, 0, 20, campo, label)
  },

  // 27. FOLIO_PROV: Opcional, varchar(40)
  {
    campo: 'FOLIO_PROV',
    label: 'Folio Prov',
    exec: (inst : any, campo, label) => validators.length(inst.FOLIO_PROV, 0, 40, campo, label)
  },

  // 28. ANOMES_CONT: Opcional, varchar(6)
  {
    campo: 'ANOMES_CONT',
    label: 'Ano Mes Cont',
    exec: (inst : any, campo, label) =>
      validators.length(inst.ANOMES_CONT, 0, 6, campo, label) ||
      validators.isAnioMes(inst.ANOMES_CONT, campo, label)
  },

  // 29. ANO_MES_PAGO: Opcional, varchar(6)
  {
    campo: 'ANO_MES_PAGO',
    label: 'Ano Mes Pago',
    exec: (inst : any, campo, label) =>
      validators.length(inst.ANO_MES_PAGO, 0, 6, campo, label) ||
      validators.isAnioMes(inst.ANO_MES_PAGO, campo, label)
  },

  // 30. ANO_MES: Obligatorio, varchar(6)
  {
    campo: 'ANO_MES',
    label: 'Ano Mes',
    exec: (inst : any, campo, label) =>
      validators.isNotNull(inst.ANO_MES, campo, label) ||
      validators.length(inst.ANO_MES, 1, 6, campo, label) ||
      validators.isAnioMes(inst.ANO_MES, campo, label)
  },

  // 31. IMP_ISR_RET: Obligatorio, numeric(12,2)
  {
    campo: 'IMP_ISR_RET',
    label: 'Imp ISR Ret',
    exec: (inst : any, campo, label) =>
      validators.isNotNull(inst.IMP_ISR_RET, campo, label) ||
      validators.isDecimalScale(inst.IMP_ISR_RET, 12, 2, campo, label) ||
      validators.isNonNegative(inst.IMP_ISR_RET, campo, label)
  },

  // 32. IMP_IVA_RET: Obligatorio, numeric(12,2)
  {
    campo: 'IMP_IVA_RET',
    label: 'Imp IVA Ret',
    exec: (inst : any, campo, label) =>
      validators.isNotNull(inst.IMP_IVA_RET, campo, label) ||
      validators.isDecimalScale(inst.IMP_IVA_RET, 12, 2, campo, label) ||
      validators.isNonNegative(inst.IMP_IVA_RET, campo, label)
  },

  // 33. IMP_IEPS: Obligatorio, numeric(12,2)
  {
    campo: 'IMP_IEPS',
    label: 'Imp IEPS',
    exec: (inst : any, campo, label) =>
      validators.isNotNull(inst.IMP_IEPS, campo, label) ||
      validators.isDecimalScale(inst.IMP_IEPS, 12, 2, campo, label) ||
      validators.isNonNegative(inst.IMP_IEPS, campo, label)
  },

  // 34. IMP_LOCAL: Obligatorio, numeric(12,2)
  {
    campo: 'IMP_LOCAL',
    label: 'Imp Local',
    exec: (inst : any, campo, label) =>
      validators.isNotNull(inst.IMP_LOCAL, campo, label) ||
      validators.isDecimalScale(inst.IMP_LOCAL, 12, 2, campo, label) ||
      validators.isNonNegative(inst.IMP_LOCAL, campo, label)
  },

  // 35. F_LIMIT_PAGO: Opcional, date
  {
    campo: 'F_LIMIT_PAGO',
    label: 'F Limite',
    exec: (inst : any, campo, label) => validators.isDateFormat(inst.F_LIMIT_PAGO, campo, label)
  },
];

// Reglas que ejecuta el motor: generadas + las del archivo manual
const reglas: ValidationRule[] = [...reglasGeneradas, ...(manual.reglas ?? [])];

// Campos que no se pueden modificar una vez creado el registro (EDITABLE=NO y PK)
const noEditables = [
  { campo: 'CVE_EMPRESA', label: 'Cve Empresa' },
  { campo: 'UUID', label: 'UUID' },
  { campo: 'CVE_TIPO_FACTURA', label: 'Tipo Factura' },
  { campo: 'F_OPERACION', label: 'F Operación' },
  { campo: 'F_CAPTURA', label: 'F Captura' },
  { campo: 'F_CANCELACION', label: 'F Cancelacion' },
  { campo: 'F_PAGO', label: 'F Pago' },
  { campo: 'CVE_MONEDA', label: 'Cve Moneda' },
  { campo: 'TIPO_CAMBIO', label: 'Tipo Cambio' },
  { campo: 'NUM_CHEQUE', label: 'Num Cheque' },
  { campo: 'NUM_DOCTO_REF', label: 'Docto Ref' },
  { campo: 'REFER_PAGO', label: 'Ref Pago' },
  { campo: 'NOMBRE_DOCTO_PDF', label: 'Docto PDF' },
  { campo: 'NOMBRE_DOCTO_XML', label: 'Docto xml' },
  { campo: 'ID_CONCILIA_CXP', label: 'Id Concilia' },
  { campo: 'SIT_CONCILIA_CXP', label: 'Sit Concilia' },
  { campo: 'SIT_C_X_P', label: 'Sit CxP' },
  { campo: 'CVE_MOT_CONCIL', label: 'Mot Concilia' },
  { campo: 'SERIE_PROV', label: 'Serie Prov' },
  { campo: 'FOLIO_PROV', label: 'Folio Prov' },
  { campo: 'ANOMES_CONT', label: 'Ano Mes Cont' },
  { campo: 'ANO_MES_PAGO', label: 'Ano Mes Pago' },
  { campo: 'ANO_MES', label: 'Ano Mes' },
  { campo: 'IMP_ISR_RET', label: 'Imp ISR Ret' },
  { campo: 'IMP_IVA_RET', label: 'Imp IVA Ret' },
  { campo: 'IMP_IEPS', label: 'Imp IEPS' },
  { campo: 'IMP_LOCAL', label: 'Imp Local' },
  { campo: 'F_LIMIT_PAGO', label: 'F Limite' },
];
