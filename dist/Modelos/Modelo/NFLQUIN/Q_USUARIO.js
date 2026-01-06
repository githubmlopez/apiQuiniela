// --- Codigo generado de manera automatica -----
import { DataTypes } from 'sequelize';
export async function def_Q_USUARIO(sequelize) {
    // La constante se define porque es necesaria en HOOKS
    const Q_USUARIO = sequelize.define('Q_USUARIO', {
        CVE_USUARIO: {
            type: DataTypes.STRING(100),
            allowNull: false,
            primaryKey: true
        },
        ID_QUINIELA: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        ID_PARTICIPANTE: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
    }, {
        modelName: 'Q_USUARIO',
        tableName: 'Q_USUARIO',
        schema: 'dbo',
        timestamps: false,
        indexes: [{
                name: 'PK_Q_USUARIO',
                unique: true,
                fields: [
                    'CVE_USUARIO',
                ]
            }
        ]
    });
    // Se retorna valor para usos especificos de esta función
    return sequelize.models.Q_USUARIO;
}
// ----------------------------------------------  
