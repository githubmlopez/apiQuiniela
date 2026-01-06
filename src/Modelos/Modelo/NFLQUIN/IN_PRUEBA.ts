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


   return sequelize.models.IN_PRUEBA
}

