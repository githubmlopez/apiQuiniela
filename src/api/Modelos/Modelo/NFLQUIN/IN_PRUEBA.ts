import {construirErroresValidacion} from 
'@router/index.js';
import {validators } from 
  '@util/index.js';
import {runValidationEngine, } from 
  '@util/index.js';
import { hash } from 'argon2';
 
// --- Codigo generado de manera automatica -----
import { DataTypes } from 'sequelize'

 
export async function def_IN_PRUEBA(sequelize: any) {
   const IN_PRUEBA = sequelize.define(
   'IN_PRUEBA',
   {
      NUM_CLIENTE : {
         type: DataTypes.INTEGER  ,
         allowNull: false,
         primaryKey: true
      },
      NOMBRE_CLIENTE : {
         type: DataTypes.STRING (50),
         allowNull: true,
      },
      TIPO_CLIENTE : {
         type: DataTypes.STRING (2),
         allowNull: true,
      },
      IMP_SUELDO : {
         type: DataTypes.DECIMAL (16,2),
         allowNull: true,
      },
      IMP_SOBRE_SUELDO : {
         type: DataTypes.DECIMAL (16,2),
         allowNull: true,
      },
      F_INGRESO : {
         type: DataTypes.DATEONLY  ,
         allowNull: true,
      },
      DESCRIPCION : {
         type: DataTypes.STRING (200),
         allowNull: true,
      },
      B_ACTIVO : {
         type: DataTypes.BOOLEAN  ,
         allowNull: true,
      },
   },
   {
      modelName: 'IN_PRUEBA',
      tableName: 'IN_PRUEBA',
      schema: 'dbo',
      timestamps: false,
      indexes: [ {
         name : 'PK_INF_PRUEBA',
         unique : true,
         fields : [
                'NUM_CLIENTE',
         ]
      }
      ]
   }
   );

// ----------------------------------------------
// ============================================
// 🧩 Hook BEFORE VALIDATE para FC_SEG_USUARIO
// ============================================
IN_PRUEBA.addHook('beforeValidate', async (instance: any, options: any) => {

  interface ValidationRule {
  /** * Nombre del atributo en el modelo (ej: 'NOMBRE', 'SIT_USUARIO') 
   */
  campo: string;
  label: string;

  /** * Función que recibe la instancia del modelo y devuelve:
   * - Un objeto { campo, mensaje } si la validación falla.
   * - null si la validación es exitosa.
   */
  exec: (instance: any, campo : string, label: string) => { campo: string; mensaje: string } | null;

  /** * (Opcional) Arreglo de otros campos que, si cambian, deben disparar 
   * esta validación también (ej: validar 'IMP_BONO' si cambió 'IMP_SUELDO').
   */
  dependencias?: string[];
}
  const rules: ValidationRule[] = [
    // 1. NUM_CLIENTE: Obligatorio, Numerico
    {
      campo: 'NUM_CLIENTE',
      label: 'El Num Cliente',
      exec: (inst : any, campo, label) => 
        validators.isNotNull(inst.NUM_CLIENTE, campo, label)
    },

    // 2. NOMBRE: Obligatorio, Máx 50 chars
    {
      campo: 'NOMBRE',
      label: 'El Nombre',
      exec: (inst : any, campo, label) => 
        validators.isNotNull(inst.NOMBRE, campo, label) || 
        validators.length(inst.NOMBRE, 1, 50, campo, label)
    },

    // 3. TIPO CLIENTE : Obligatorio, Valores H,C,O
    {
      campo: 'TIPO_CLIENTE',
      label: 'Tipo Cliente',
      exec: (inst : any, campo, label) => 
        validators.isNotNull(inst.TIPO_CLIENTE, campo, label) || 
        validators.oneOf(inst.TIPO_CLIENTE, ['ADMINISTRADOR', 'PARTICIPANTE', 'SISTEMAS', 'TEMPORAL'], campo, label)
    },

    // 4. IMP_SUELDO: Obligatorio
    {
      campo: 'IMP_SUELDO',
      label: 'El sueldo',
        exec: (inst : any, campo, label) => 
        validators.isNotNull(inst.IMP_SUELDO, campo, label) ||
        validators.isDecimalScale(inst.IMP_SOBRE_SUELDO, 16, 2, campo, label)
    },

    // 5. PASSWORD: Opcional (NULL en DB), Máx 256 chars
    {
      campo: 'IMP_SOBRE_SUELDO',
      label: 'Sobresueldo',
      exec: (inst : any, campo, label) =>  validators.isNotNull(inst.IMP_SOBRE_SUELDO, campo, label) ||
            validators.isDecimalScale(inst.IMP_SOBRE_SUELDO, 16, 2, campo, label)
    },

    // 6. F_INGRESO: Obligatorio, tipo Fecha
    {
      campo: 'F_INGRESO',
      label: 'F ingreso',
      exec: (inst : any, campo, label) =>  validators.isDateFormat(inst.F_INGRESO, campo, label)
    },

    // 7. SIT_USUARIO: Obligatorio, , Máx 200 chars
    {
      campo: 'DESCRIPCION',
      label: 'La Descripcion',
      exec: (inst : any, campo, label) =>  
        validators.isNotNull(inst.DESCRIPCION, campo, label) || 
        validators.length(inst.DESCRIPCION, 1, 200, campo, label)

    },

    // 8. B_ACTIVO: Tipo Boleano
    {
      campo: 'B_ACTIVO',
      label: 'Bandera',
       exec: (inst : any, campo, label) =>  validators.isBoolean(inst.B_ACTIVO, campo, label)
    },
  ];

  // Ejecución centralizada
  await runValidationEngine(instance, rules, construirErroresValidacion, options);

});

}