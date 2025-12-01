import { DataTypes,  ValidationError, ValidationErrorItem } from 'sequelize';
import {construirErroresValidacion} from 
  '../../../Router/Servicios/index.js';

 
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
   )

  // =========================================
  // 🧩 Hook BEFORE VALIDATE
  // =========================================
IN_PRUEBA.addHook('beforeValidate', async (instance: any, options: any) => {
  const errores: { campo: string; mensaje: string }[] = [];
  const kNegPrefix = '[N]:';
  const isCreate = instance.isNewRecord;
  const changedFields = instance.changed() || [];

  // Helper para saber si validar un campo
  const shouldValidate = (campo: string) => isCreate || changedFields.includes(campo);

  // 1️⃣ Validar TIPO_CLIENTE
  if (shouldValidate('TIPO_CLIENTE')) {
    if (instance.TIPO_CLIENTE && !['H', 'C'].includes(instance.TIPO_CLIENTE)) {
      errores.push({ campo: 'TIPO_CLIENTE', mensaje: `${kNegPrefix} TIPO_CLIENTE debe ser 'H' o 'C'` });
    }
  }

  // 2️⃣ Validar IMP_SOBRE_SUELDO (no más del 20% del sueldo)
  if (shouldValidate('IMP_SOBRE_SUELDO') || shouldValidate('IMP_SUELDO')) {
    if (
      instance.IMP_SUELDO != null &&
      instance.IMP_SOBRE_SUELDO != null &&
      parseFloat(instance.IMP_SOBRE_SUELDO) > parseFloat(instance.IMP_SUELDO) * 0.2
    ) {
      errores.push({
        campo: 'IMP_SOBRE_SUELDO',
        mensaje: `${kNegPrefix} IMP_SOBRE_SUELDO no puede ser mayor al 20% del sueldo`,
      });
    }
  }

  // 3️⃣ Validar F_INGRESO (YYYY-MM-DD)
  if (shouldValidate('F_INGRESO')) {
    if (instance.F_INGRESO) {
      const regexFecha = /^\d{4}\-\d{2}\-\d{2}$/;
      if (!regexFecha.test(instance.F_INGRESO)) {
        errores.push({ campo: 'F_INGRESO', mensaje: `${kNegPrefix} F_INGRESO debe tener formato YYYY/MM/DD` });
      }
    }
  }

  // 4️⃣ Validar B_ACTIVO ('1' o '0')
  if (shouldValidate('B_ACTIVO')) {
    if (instance.B_ACTIVO !== undefined && instance.B_ACTIVO !== null) {
      if (typeof instance.B_ACTIVO !== 'boolean') {
        errores.push({ campo: 'B_ACTIVO', mensaje: `${kNegPrefix} B_ACTIVO debe ser true o false` });
      }
    }
  }

  // 🚨 Lanzar ValidationError si hay errores
  if (errores.length > 0) {
    throw construirErroresValidacion(errores, instance);
  }
});

   return sequelize.models.IN_PRUEBA
}

