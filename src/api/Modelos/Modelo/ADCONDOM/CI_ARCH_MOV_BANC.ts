import { DataTypes } from 'sequelize'

export async function def_CI_ARCH_MOV_BANC(sequelize: any) {

   // La constante se define porque es necesaria en HOOKS
   const CI_ARCH_MOV_BANC = sequelize.define(
   'CI_ARCH_MOV_BANC',
   {
      ID_EMPRESA: {
         type: DataTypes.INTEGER,
         allowNull: false,
         primaryKey: true
      },
      CVE_CHEQUERA: {
         type: DataTypes.STRING(6),
         allowNull: false,
         primaryKey: true
      },
      ANO_MES: { // Ajustado a ANOMES para coincidir con el campo de la tabla SQL
         type: DataTypes.STRING(6),
         allowNull: false,
         primaryKey: true
      },
      SECUENCIA: {
         type: DataTypes.INTEGER,
         allowNull: false,
         primaryKey: true
      },
      REGISTRO: {
         type: DataTypes.TEXT('long'), // Equivale a VARCHAR(MAX) en SQL Server
         allowNull: true
      },
   },
   {
      modelName: 'CI_ARCH_MOV_BANC',
      tableName: 'CI_ARCH_MOV_BANC',
      schema: 'dbo',
      timestamps: false,
      indexes: [
         {
            name: 'PK_CI_ARCH_MOV_BANC',
            unique: true,
            fields: [
               'ID_EMPRESA',
               'CVE_CHEQUERA',
               'ANOMES',
               'SECUENCIA'
            ]
         }
      ]
   }
   );

   return CI_ARCH_MOV_BANC;
}