/*
import { DataTypes, Sequelize } from 'sequelize'
 
export async function def_FC_SEG_USUARIO(sequelize: any) {
   sequelize.define(
   'FC_SEG_USUARIO',
   {
      CVE_USUARIO : {
         type: DataTypes.STRING (100),
         allowNull: false,
         primaryKey: true
      },
      APELLIDO_PATERNO : {
         type: DataTypes.STRING (50),
         allowNull: false,
      },
      APELLIDO_MATERNO : {
         type: DataTypes.STRING (50),
         allowNull: false,
      },
      NOMBRE : {
         type: DataTypes.STRING (50),
         allowNull: false,
      },
      PASSWORD : {
         type: DataTypes.STRING (256),
         allowNull: true,
      },
      B_BLOQUEADO : {
         type: DataTypes.BOOLEAN  ,
         allowNull: false,
      },
      SIT_USUARIO : {
         type: DataTypes.STRING (2),
         allowNull: false,
      },
      CVE_IDIOMA : {
         type: DataTypes.STRING (2),
         allowNull: true,
      },
   },
   {
      modelName: 'FC_SEG_USUARIO',
      tableName: 'FC_SEG_USUARIO',
      schema: 'dbo',
      timestamps: false,
      indexes: [ {
         name : 'PK_CF_SEG_USUARIO',
         unique : true,
         fields : [
                'CVE_USUARIO',
         ]
      }
      ]
   }
   )
   return sequelize.models.FC_SEG_USUARIO
}
   */
import { DataTypes, Sequelize } from 'sequelize'
 
export async function def_FC_SEG_USUARIO(sequelize: any) {
   sequelize.define(
   'FC_SEG_USUARIO',
   {
      CVE_USUARIO : {
         type: DataTypes.STRING (100),
         allowNull: false,
         primaryKey: true
      },
      APELLIDO_PATERNO : {
         type: DataTypes.STRING (50),
         allowNull: false,
      },
      APELLIDO_MATERNO : {
         type: DataTypes.STRING (50),
         allowNull: false,
      },
      NOMBRE : {
         type: DataTypes.STRING (50),
         allowNull: false,
      },
      PASSWORD : {
         type: DataTypes.STRING (256),
         allowNull: true,
      },
      B_BLOQUEADO : {
         type: DataTypes.BOOLEAN  ,
         allowNull: false,
      },
      SIT_USUARIO : {
         type: DataTypes.STRING (2),
         allowNull: false,
      },
      CVE_IDIOMA : {
         type: DataTypes.STRING (2),
         allowNull: true,
      },
      CVE_PERFIL : {
         type: DataTypes.STRING (20),
         allowNull: true,
      },
   },
   {
      modelName: 'FC_SEG_USUARIO',
      tableName: 'FC_SEG_USUARIO',
      schema: 'dbo',
      timestamps: false,
      indexes: [ {
         name : 'PK_CF_SEG_USUARIO',
         unique : true,
         fields : [
                'CVE_USUARIO',
         ]
      }
      ]
   }
   )
   return sequelize.models.FC_SEG_USUARIO
}
