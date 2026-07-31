import { DataTypes } from 'sequelize'

export async function def_CI_MOVTO_BANCARIO(sequelize: any) {

   // La constante se define porque es necesaria en HOOKS
   const CI_MOVTO_BANCARIO = sequelize.define(
   'CI_MOVTO_BANCARIO',
   {
      CVE_EMPRESA: {
         type: DataTypes.STRING(4),
         allowNull: false,
         primaryKey: true
      },
      ID_MOVTO_BANCARIO: {
         type: DataTypes.INTEGER,
         allowNull: false,
         primaryKey: true
      },
      ANO_MES: {
         type: DataTypes.STRING(6),
         allowNull: false
      },
      F_OPERACION: {
         type: DataTypes.DATEONLY, // Corresponde al tipo [date] de SQL Server
         allowNull: false
      },
      CVE_CHEQUERA: {
         type: DataTypes.STRING(6),
         allowNull: false
      },
      CVE_CARGO_ABONO: {
         type: DataTypes.STRING(1),
         allowNull: false
      },
      IMP_TRANSACCION: {
         type: DataTypes.DECIMAL(12, 2), // Corresponde a numeric(12, 2)
         allowNull: false
      },
      CVE_TIPO_MOVTO: {
         type: DataTypes.STRING(6),
         allowNull: true
      },
      DESCRIPCION: {
         type: DataTypes.STRING(250),
         allowNull: false
      },
      SIT_CONCILIA_BANCO: {
         type: DataTypes.STRING(2),
         allowNull: false
      },
      SIT_MOVTO: {
         type: DataTypes.STRING(2),
         allowNull: false
      },
      B_OPER_DEFAULT: {
         type: DataTypes.BOOLEAN, // Corresponde a [bit] en SQL Server
         allowNull: false
      },
      REFERENCIA: {
         type: DataTypes.STRING(20),
         allowNull: true
      },
      REF_EMP: {
         type: DataTypes.STRING(50),
         allowNull: true
      },
      B_REFERENCIA: {
         type: DataTypes.BOOLEAN, // Corresponde a [bit] en SQL Server
         allowNull: false
      }
   },
   {
      modelName: 'CI_MOVTO_BANCARIO',
      tableName: 'CI_MOVTO_BANCARIO',
      schema: 'dbo',
      timestamps: false,
      indexes: [
         {
            name: 'PK_CI_MOVTO_BANCARIO',
            unique: true,
            fields: [
               'CVE_EMPRESA',
               'ID_MOVTO_BANCARIO'
            ]
         }
      ]
   }
   );

   return CI_MOVTO_BANCARIO;
}