import { DataTypes } from 'sequelize';
export async function def_Q_QUIN_PARTICIPANTE(sequelize) {
    sequelize.define('Q_QUIN_PARTICIPANTE', {
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
        ID_PARTIDO: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true
        },
        ID_SCORE_E1: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        ID_SCORE_E2: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        DIF_PUNTOS: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        CVE_GANADOR: {
            type: DataTypes.STRING(1),
            allowNull: true,
        },
        PUNTOS: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
    }, {
        modelName: 'Q_QUIN_PARTICIPANTE',
        tableName: 'Q_QUIN_PARTICIPANTE',
        schema: 'dbo',
        timestamps: false,
        indexes: [{
                name: 'PK_Q_QUIN_PARTICIPANTE',
                unique: true,
                fields: [
                    'ID_PARTICIPANTE',
                    'ID_PARTIDO',
                    'ID_PERIODO',
                    'ID_QUINIELA',
                ]
            }
        ]
    });
    return sequelize.models.Q_QUIN_PARTICIPANTE;
}
