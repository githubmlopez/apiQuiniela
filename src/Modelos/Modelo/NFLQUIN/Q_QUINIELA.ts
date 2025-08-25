import { DataTypes, Model, Sequelize } from 'sequelize';

interface I_Q_QUINIELA {
  ID_QUINIELA: number;
  TIT_QUINIELA?: string;
  TIPO_DEPORTE?: string;
  COSTO_QUINIELA?: number;
  SITUACION?: string;
}

interface I_Q_QUINIELA_INST extends Model<I_Q_QUINIELA, I_Q_QUINIELA>, I_Q_QUINIELA {}

export function createIsInModelValidator(fieldName: keyof I_Q_QUINIELA_INST, allowedValues: string[]) {
  // Retorna la función que Sequelize ejecutará como validador de modelo
  return function(this: I_Q_QUINIELA_INST): void {
    const idQuiniela = this.ID_QUINIELA ?? 'N/A';
    // Accede al valor del campo usando el 'fieldName' proporcionado
    const valueToValidate = this[fieldName] as string; // Asume que el valor es string para esta validación

    if (!allowedValues.includes(valueToValidate)) {
      const allowedValuesStr = allowedValues.join(' o ');
      throw new Error(`[N]:[ID: ${idQuiniela}] ${fieldName} -incorrecto (Valor: ${valueToValidate}). Los valores permitidos son ${allowedValuesStr}.`);
    }
  };
}

export async function def_Q_QUINIELA(this: any, sequelize: Sequelize) {
  sequelize.define<I_Q_QUINIELA_INST>(
    'Q_QUINIELA',
    {
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
    },
    {
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
    }
  );
  return sequelize.models.Q_QUINIELA;
}
