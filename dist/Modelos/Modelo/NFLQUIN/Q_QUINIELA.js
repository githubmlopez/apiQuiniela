// --- Codigo generado de manera automatica -----
import { DataTypes } from 'sequelize';
export async function def_Q_QUINIELA(sequelize) {
    // La constante se define porque es necesaria en HOOKS
    const Q_QUINIELA = sequelize.define('Q_QUINIELA', {
        ID_QUINIELA: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true
        },
        TIT_QUINIELA: {
            type: DataTypes.STRING(100),
            allowNull: true,
        },
        TIPO_DEPORTE: {
            type: DataTypes.STRING(2),
            allowNull: true,
        },
        COSTO_QUINIELA: {
            type: DataTypes.DECIMAL(5, 0),
            allowNull: true,
        },
        SITUACION: {
            type: DataTypes.STRING(1),
            allowNull: true,
        },
        B_DESEMPATE: {
            type: DataTypes.BOOLEAN,
            allowNull: true,
        },
        CVE_QUINIELA: {
            type: DataTypes.STRING(8),
            allowNull: true,
        },
    }, {
        modelName: 'Q_QUINIELA',
        tableName: 'Q_QUINIELA',
        schema: 'dbo',
        timestamps: false,
        indexes: [{
                name: 'PK_Q_QUINIELA',
                unique: true,
                fields: [
                    'ID_QUINIELA',
                ]
            }
        ]
    });
    // Se retorna valor para usos especificos de esta función
    return sequelize.models.Q_QUINIELA;
}
// ----------------------------------------------
