// --- Codigo generado de manera automatica -----
import { DataTypes } from 'sequelize';
export async function def_Q_SURVIVOR(sequelize) {
    // La constante se define porque es necesaria en HOOKS
    const Q_SURVIVOR = sequelize.define('Q_SURVIVOR', {
        ID_QUINIELA: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true
        },
        ID_PARTICIPANTE: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true
        },
        ID_PERIODO: {
            type: DataTypes.STRING(2),
            allowNull: false,
            primaryKey: true
        },
        ID_EQUIPO_SUV: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        SITUACION: {
            type: DataTypes.STRING(1),
            allowNull: true,
        },
        SITUACION_R: {
            type: DataTypes.STRING(1),
            allowNull: true,
        },
        B_PAGO: {
            type: DataTypes.BOOLEAN,
            allowNull: true,
        },
        B_RESUCITA: {
            type: DataTypes.BOOLEAN,
            allowNull: true,
        },
    }, {
        modelName: 'Q_SURVIVOR',
        tableName: 'Q_SURVIVOR',
        schema: 'dbo',
        timestamps: false,
        indexes: [{
                name: 'PK_Q_SURVIVOR',
                unique: true,
                fields: [
                    'ID_PARTICIPANTE',
                    'ID_PERIODO',
                    'ID_QUINIELA',
                ]
            }
        ]
    });
    // Se retorna valor para usos especificos de esta función
    return sequelize.models.Q_SURVIVOR;
}
// ----------------------------------------------
