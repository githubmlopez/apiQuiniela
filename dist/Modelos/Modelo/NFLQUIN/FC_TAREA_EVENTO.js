import { DataTypes } from 'sequelize';
export async function def_FC_TAREA_EVENTO(sequelize) {
    sequelize.define('FC_TAREA_EVENTO', {
        ID_PROCESO: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true
        },
        F_EVENTO: {
            type: DataTypes.DATEONLY,
            allowNull: false,
            primaryKey: true
        },
        ID_EVENTO: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true
        },
        CVE_TIPO_EVENTO: {
            type: DataTypes.STRING(1),
            allowNull: false,
        },
        CVE_APLICACION: {
            type: DataTypes.STRING(10),
            allowNull: false,
        },
        CVE_USUARIO: {
            type: DataTypes.STRING(100),
            allowNull: false,
        },
        DESC_ERROR: {
            type: DataTypes.STRING(80),
            allowNull: false,
        },
        MSG_ERROR: {
            type: DataTypes.STRING(400),
            allowNull: true,
        },
        ERROR_NUMBER_D: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        ERROR_SEVERITY_D: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        ERROR_STATE_D: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        ERROR_PROCEDURE_D: {
            type: DataTypes.STRING(128),
            allowNull: true,
        },
        ERROR_LINE_D: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        ERROR_MESSAGE_D: {
            type: DataTypes.STRING(4000),
            allowNull: true,
        },
    }, {
        modelName: 'FC_TAREA_EVENTO',
        tableName: 'FC_TAREA_EVENTO',
        schema: 'dbo',
        timestamps: false,
        indexes: [{
                name: 'PK_FC_TAREA_EVENTO',
                unique: true,
                fields: [
                    'F_EVENTO',
                    'ID_EVENTO',
                    'ID_PROCESO',
                ]
            }
        ]
    });
    return sequelize.models.FC_TAREA_EVENTO;
}
