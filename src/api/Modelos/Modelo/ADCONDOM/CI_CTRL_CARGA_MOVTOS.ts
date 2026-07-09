import { DataTypes } from 'sequelize'

export async function def_CI_CTRL_CARGA_MOVTOS(sequelize: any) {

   // La constante se define porque es necesaria en HOOKS
   const CI_CTRL_CARGA_MOVTOS = sequelize.define(
   'CI_CTRL_CARGA_MOVTOS',
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
      ANO_MES: { // Mantenido como ANO_MES para coincidir exactamente con el CREATE TABLE de esta tabla
         type: DataTypes.STRING(6),
         allowNull: false,
         primaryKey: true
      },
      B_CARGA_ARCH: {
         type: DataTypes.BOOLEAN, // Equivale a BIT en SQL Server
         allowNull: true
      },
      B_CARGA_EXTRAC: {
         type: DataTypes.BOOLEAN, // Equivale a BIT en SQL Server
         allowNull: true
      },
      B_CARGA_MOVTOS: {
         type: DataTypes.BOOLEAN, // Equivale a BIT en SQL Server
         allowNull: true
      },
   },
   {
      modelName: 'CI_CTRL_CARGA_MOVTOS',
      tableName: 'CI_CTRL_CARGA_MOVTOS',
      schema: 'dbo',
      timestamps: false,
      indexes: [
         {
            name: 'PK_CI_CARGA_MOV_BANC', // Nombre de la restricción original del script
            unique: true,
            fields: [
               'ID_EMPRESA',
               'CVE_CHEQUERA',
               'ANO_MES'
            ]
         }
      ]
   }
   );

   return CI_CTRL_CARGA_MOVTOS;
}