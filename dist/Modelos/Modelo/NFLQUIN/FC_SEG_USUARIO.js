import { DataTypes } from 'sequelize';
import { construirErroresValidacion } from '../../../Router/Servicios/index.js';
import { validators, } from '../../../Util/index.js';
import { runValidationEngine, } from '../../../Util/index.js';
import { hash } from 'argon2';
export async function def_FC_SEG_USUARIO(sequelize) {
    const FC_SEG_USUARIO = sequelize.define('FC_SEG_USUARIO', {
        CVE_USUARIO: {
            type: DataTypes.STRING(100),
            allowNull: false,
            primaryKey: true
        },
        APELLIDO_PATERNO: {
            type: DataTypes.STRING(50),
            allowNull: false,
        },
        APELLIDO_MATERNO: {
            type: DataTypes.STRING(50),
            allowNull: false,
        },
        NOMBRE: {
            type: DataTypes.STRING(50),
            allowNull: false,
        },
        PASSWORD: {
            type: DataTypes.STRING(256),
            allowNull: true,
        },
        B_BLOQUEADO: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
        },
        SIT_USUARIO: {
            type: DataTypes.STRING(2),
            allowNull: false,
        },
        CVE_IDIOMA: {
            type: DataTypes.STRING(2),
            allowNull: true,
        },
        CVE_PERFIL: {
            type: DataTypes.STRING(20),
            allowNull: true,
        },
        IDENTIFICADOR: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
    }, {
        modelName: 'FC_SEG_USUARIO',
        tableName: 'FC_SEG_USUARIO',
        schema: 'dbo',
        timestamps: false,
        hasTriggers: false, // 🌟 PROPIEDAD PERSONALIZADA: No afecta a Sequelize
        indexes: [{
                name: 'PK_CF_SEG_USUARIO',
                unique: true,
                fields: [
                    'CVE_USUARIO',
                ]
            }
        ]
    });
    // ============================================
    // 🧩 Hook BEFORE VALIDATE para FC_SEG_USUARIO
    // ============================================
    FC_SEG_USUARIO.addHook('beforeValidate', async (instance, options) => {
        const rules = [
            // 1. CVE_USUARIO: Obligatorio, Máx 100 chars (PK)
            {
                campo: 'CVE_USUARIO',
                label: 'El usuario',
                exec: (inst, campo, label) => validators.isNotNull(inst.CVE_USUARIO, campo, label) ||
                    validators.length(inst.CVE_USUARIO, 1, 100, campo, label) ||
                    validators.isEmail(inst.CVE_USUARIO, campo, label)
            },
            // 2. APELLIDO_PATERNO: Obligatorio, Máx 50 chars
            {
                campo: 'APELLIDO_PATERNO',
                label: 'Apellido Paterno',
                exec: (inst, campo, label) => validators.isNotNull(inst.APELLIDO_PATERNO, campo, label) ||
                    validators.length(inst.APELLIDO_PATERNO, 1, 50, campo, label)
            },
            // 3. APELLIDO_MATERNO: Obligatorio, Máx 50 chars
            {
                campo: 'APELLIDO_MATERNO',
                label: 'Apellido Materno',
                exec: (inst, campo, label) => validators.isNotNull(inst.APELLIDO_MATERNO, campo, label) ||
                    validators.length(inst.APELLIDO_MATERNO, 1, 50, campo, label)
            },
            // 4. NOMBRE: Obligatorio, Máx 50 chars
            {
                campo: 'NOMBRE',
                label: 'Nombre',
                exec: (inst, campo, label) => validators.isNotNull(inst.NOMBRE, campo, label) ||
                    validators.length(inst.NOMBRE, 1, 50, campo, label)
            },
            // 5. PASSWORD: Opcional (NULL en DB), Máx 256 chars
            {
                campo: 'PASSWORD',
                label: 'Password',
                exec: (inst, campo, label) => validators.length(inst.PASSWORD, 0, 256, campo, label)
            },
            // 6. B_BLOQUEADO: Obligatorio, tipo BIT (Booleano)
            {
                campo: 'B_BLOQUEADO',
                label: 'Indica Bloqueo',
                exec: (inst, campo, label) => validators.isBoolean(inst.B_BLOQUEADO, campo, label)
            },
            // 7. SIT_USUARIO: Obligatorio, Constraint (A, I, B)
            {
                campo: 'SIT_USUARIO',
                label: 'Situacion',
                exec: (inst, campo, label) => validators.isNotNull(inst.SIT_USUARIO, campo, label) ||
                    validators.oneOf(inst.SIT_USUARIO, ['A', 'I', 'B'], campo, label)
            },
            // 8. CVE_IDIOMA: Opcional, Máx 2 chars
            {
                campo: 'CVE_IDIOMA',
                label: 'Clave Idioma',
                exec: (inst, campo, label) => validators.length(inst.CVE_IDIOMA, 0, 2, campo, label)
            },
            // 9. CVE_PERFIL: Opcional, Máx 20 chars
            {
                campo: 'CVE_PERFIL',
                label: 'Perfil',
                exec: (inst, campo, label) => validators.length(inst.CVE_PERFIL, 0, 20, campo, label)
            },
            {
                campo: 'IDENTIFICADOR',
                label: 'Identificador',
                exec: (inst, campo, label) => validators.isNumeric(inst.IDENTIFICADOR, campo, label)
            },
        ];
        // Ejecución centralizada
        await runValidationEngine(instance, rules, construirErroresValidacion, options);
    });
    // ============================================
    // 🧩 Hook BEFORE SAVE para FC_SEG_USUARIO
    // ============================================
    FC_SEG_USUARIO.addHook('beforeSave', async (instance) => {
        // Ejemplo de transformación
        instance.PASSWORD = await hash(instance.PASSWORD);
    });
    return sequelize.models.FC_SEG_USUARIO;
}
