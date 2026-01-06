// --- Codigo generado de manera automatica -----
import { DataTypes } from 'sequelize'
 
export async function def_Q_PERIODO(sequelize: any) {
   // La constante se define porque es necesaria en HOOKS
   const Q_PERIODO = sequelize.define(
   'Q_PERIODO',
   {
      ID_QUINIELA : {
         type: DataTypes.INTEGER  ,
         allowNull: false,
         primaryKey: true
      },
      ID_PERIODO : {
         type: DataTypes.STRING (2),
         allowNull: false,
         primaryKey: true
      },
      TIT_PERIODO : {
         type: DataTypes.STRING (20),
         allowNull: true,
      },
      COSTO_SURVIVOR : {
         type: DataTypes.DECIMAL (12,2),
         allowNull: true,
      },
      B_ABIERTO : {
         type: DataTypes.BOOLEAN  ,
         allowNull: true,
      },
      B_RES_SURV : {
         type: DataTypes.BOOLEAN  ,
         allowNull: true,
      },
      F_LIMITE : {
         type: DataTypes.DATEONLY  ,
         allowNull: true,
      },
      HORA_LIMITE : {
         type: DataTypes.STRING (8),
         allowNull: true,
      },
      B_INICIO_DIA : {
         type: DataTypes.BOOLEAN  ,
         allowNull: false,
      },
      B_CIERRE_PER : {
         type: DataTypes.BOOLEAN  ,
         allowNull: false,
      },
      IMP_PREMIO : {
         type: DataTypes.DECIMAL (12,2),
         allowNull: true,
      },
   },
   {
      modelName: 'Q_PERIODO',
      tableName: 'Q_PERIODO',
      schema: 'dbo',
      timestamps: false,
      indexes: [ {
         name : 'PK_Q_PERIODO',
         unique : true,
         fields : [
                'ID_PERIODO',
                'ID_QUINIELA',
         ]
      }
      ]
   }
   )
   // Se retorna valor para usos especificos de esta función
   return sequelize.models.Q_PERIODO
}
// ----------------------------------------------