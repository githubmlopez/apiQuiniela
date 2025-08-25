import { DataTypes } from 'sequelize';
export async function def_Q_PARTIDO(sequelize) {
    sequelize.define('Q_PARTIDO', {
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
        ID_EQUIPO_1: {
            type: DataTypes.INTEGER,
            allowNull: true
        },
        ID_EQUIPO_2: {
            type: DataTypes.INTEGER,
            allowNull: true
        },
        ID_SCORE_E1: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        ID_SCORE_E2: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        F_PARTIDO: {
            type: DataTypes.DATEONLY,
            allowNull: true,
        },
        HORA_PARTIDO: {
            type: DataTypes.STRING(15),
            allowNull: true,
        },
        ESTADIO: {
            type: DataTypes.STRING(50),
            allowNull: true,
        },
        F_TEXTO: {
            type: DataTypes.STRING(50),
            allowNull: true,
        },
        SIT_PARTIDO: {
            type: DataTypes.STRING(2),
            allowNull: true,
        },
    }, {
        modelName: 'Q_PARTIDO',
        tableName: 'Q_PARTIDO',
        schema: 'dbo',
        timestamps: false,
        indexes: [{
                name: 'PK_Q_PARTIDO',
                unique: true,
                fields: [
                    'ID_PARTIDO',
                    'ID_PERIODO',
                ]
            }
        ]
    });
    return sequelize.models.Q_PARTIDO;
}
