import { DataTypes } from 'sequelize';
export function createIsInModelValidator(fieldName, allowedValues) {
    // Retorna la función que Sequelize ejecutará como validador de modelo
    return function () {
        const idQuiniela = this.ID_QUINIELA ?? 'N/A';
        // Accede al valor del campo usando el 'fieldName' proporcionado
        const valueToValidate = this[fieldName]; // Asume que el valor es string para esta validación
        if (!allowedValues.includes(valueToValidate)) {
            const allowedValuesStr = allowedValues.join(' o ');
            throw new Error(`[N]:[ID: ${idQuiniela}] ${fieldName} -incorrecto (Valor: ${valueToValidate}). Los valores permitidos son ${allowedValuesStr}.`);
        }
    };
}
export async function def_Q_QUINIELA(sequelize) {
    sequelize.define('Q_QUINIELA', {
        ID_QUINIELA: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
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
            allowNull: true
        },
    }, {
        modelName: 'Q_QUINIELA',
        tableName: 'Q_QUINIELA',
        schema: 'dbo',
        timestamps: false,
        indexes: [
            {
                name: 'PK_Q_QUINIELA',
                unique: true,
                fields: ['ID_QUINIELA'],
            },
        ],
        /*
        validate: {
          // Llama a la función de fábrica que CREA la función de validación
          validateTipoDeporteModel: createIsInModelValidator('TIPO_DEPORTE', ['FA', 'FS']),
        }, */
    });
    return sequelize.models.Q_QUINIELA;
}
