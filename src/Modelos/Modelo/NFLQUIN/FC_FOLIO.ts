// --- Codigo generado de manera automatica -----
import { DataTypes } from 'sequelize'
 
export async function def_FC_FOLIO(sequelize: any) {
   // La constante se define porque es necesaria en HOOKS
   const FC_FOLIO = sequelize.define(
   'FC_FOLIO',
   {
      CVE_FOLIO : {
         type: DataTypes.STRING (4),
         allowNull: false,
         primaryKey: true
      },
      DESC_FOLIO : {
         type: DataTypes.STRING (20),
         allowNull: false,
      },
      FOLIO : {
         type: DataTypes.INTEGER  ,
         allowNull: false,
      },
   },
   {
      modelName: 'FC_FOLIO',
      tableName: 'FC_FOLIO',
      schema: 'dbo',
      timestamps: false,
      indexes: [ {
         name : 'PK_FC_FOLIO',
         unique : true,
         fields : [
                'CVE_FOLIO',
         ]
      }
      ]
   }
   )
   // Se retorna valor para usos especificos de esta función
   return sequelize.models.FC_FOLIO
}
// ----------------------------------------------