// --- Codigo generado de manera automatica -----
import { DataTypes } from 'sequelize'
 
export async function def_FC_SEG_PASS_RESET(sequelize: any) {
   // La constante se define porque es necesaria en HOOKS
   const FC_SEG_PASS_RESET = sequelize.define(
   'FC_SEG_PASS_RESET',
   {
      TOKEN_HASH : {
         type: DataTypes.STRING (128),
         allowNull: false,
         primaryKey: true
      },
      CVE_USUARIO : {
         type: DataTypes.STRING (100),
         allowNull: false,
      },
      F_EXPIRACION : {
         type: DataTypes.STRING(25)  ,
         allowNull: false,
      },
      F_CREACION : {
         type: DataTypes.STRING(25)  ,
         allowNull: true,
      },
   },
   {
      modelName: 'FC_SEG_PASS_RESET',
      tableName: 'FC_SEG_PASS_RESET',
      schema: 'dbo',
      timestamps: false,
      indexes: [ {
         name : 'PK__FC_SEG_P__DC5A8AEEC74B2FD2',
         unique : true,
         fields : [
                'TOKEN_HASH',
         ]
      }
      ]
   }
   )
   // Se retorna valor para usos especificos de esta función
   return sequelize.models.FC_SEG_PASS_RESET
}
// ----------------------------------------------