import { ValidationError, ValidationErrorItem } from 'sequelize';
import { getInstancia } from '../../index.js';
const kCorrecto = 1;
const kErrorNeg = 3;
// Function to generate the where clause for findOne based on primary keys
function buildPKWhereClause(model, data) {
    console.log('✅ Model', model);
    const primaryKeyAttributes = model.primaryKeyAttributes;
    console.log('✅ pk ** ' + JSON.stringify(primaryKeyAttributes), data);
    const whereClause = {};
    primaryKeyAttributes.forEach((key) => {
        if (data[key] !== undefined) {
            whereClause[key] = data[key];
        }
        else {
            throw (`No existe valor para llave primaria  ${key} `);
        }
    });
    return whereClause;
}
export async function findOneByPrimaryKey(model, data, // Using Partial<M> as we might only have PK values
options) {
    const whereClause = buildPKWhereClause(model, data);
    console.log('WHERE ** ' + JSON.stringify(whereClause));
    const resultado = await model.findOne({ where: whereClause, ...options });
    const numReg = 1;
    return { estatus: kCorrecto, data: [resultado], errorUs: null, errorNeg: null };
}
export async function createRecord(model, data, opciones) {
    console.log(data);
    console.log(model.primaryKeyAttributes);
    const existingRecord = await findOneByPrimaryKey(model, data);
    if (existingRecord && existingRecord.data && existingRecord.data.length > 0 && existingRecord.data[0]?.dataValues) {
        // throw ('Registro ya existe ' + model.name);
        return {
            estatus: kErrorNeg,
            data: null,
            errorUs: null,
            errorNeg: ['Registro ya existe']
        };
    }
    else {
        const resultado = await obtResultado(async (model, data, opciones) => {
            const instance = await model.create(data, opciones);
            return instance;
        }, model, data, opciones);
        const resData = obtContadorReg(resultado.validationErrors);
        return { estatus: resultado.estatus,
            data: resData,
            errorUs: null,
            errorNeg: resultado.validationErrors };
    }
}
export async function updateRecord(model, data, opciones) {
    console.log('✅ Procesando elemento U ', model, data);
    console.log(model.primaryKeyAttributes);
    const existingRecord = await findOneByPrimaryKey(model, data, opciones);
    if (existingRecord && existingRecord.data && existingRecord.data.length > 0 && existingRecord.data[0]?.dataValues) {
        const whereClause = buildPKWhereClause(model, data);
        const resultado = await obtResultado(async (model, data, opciones) => {
            const instance = await model.update(data, {
                where: whereClause,
                individualHooks: true, // 🔥 activa validaciones y hooks
                ...opciones
            });
            return instance;
        }, model, data, opciones);
        const resData = obtContadorReg(resultado.validationErrors);
        return { estatus: kCorrecto, data: resData, errorUs: null, errorNeg: resultado.validationErrors };
    }
    else {
        return {
            estatus: kErrorNeg,
            data: null,
            errorUs: null,
            errorNeg: ['Registro a actualizar no existe']
        };
    }
}
export async function DeleteRecord(model, data, opciones) {
    console.log(data);
    console.log(model.primaryKeyAttributes);
    const existingRecord = await findOneByPrimaryKey(model, data);
    if (existingRecord && existingRecord.data && existingRecord.data.length > 0 && existingRecord.data[0]?.dataValues) {
        const resultado = await obtResultado(async (existingRecord, opciones) => {
            const instance = await existingRecord.data[0].destroy();
            return instance;
        }, existingRecord, opciones);
        const resData = obtContadorReg(resultado.validationErrors);
        return { estatus: kCorrecto, data: resData, errorUs: null, errorNeg: resultado.validationErrors };
    }
    else {
        return {
            estatus: kErrorNeg,
            data: null,
            errorUs: null,
            errorNeg: ['Registro a borrar no existe']
        };
    }
}
export async function bulkCreateRecords(model, data, opciones) {
    const sequelize = await getInstancia();
    const transactionContext = opciones?.transaction || await sequelize.transaction();
    const resultado = await obtResultado(async (model, data, opciones) => {
        const instance = await model.bulkCreate(data);
        return instance;
    }, model, data, { transaction: transactionContext });
    const resData = obtContadorReg(resultado.validationErrors);
    return { estatus: kCorrecto, data: resData, errorUs: null, errorNeg: resultado.validationErrors };
}
export async function bulkUpdateRecords(model, dataArray) {
    // Validación básica del arreglo de entrada
    if (!Array.isArray(dataArray) || dataArray.length === 0) {
        throw ('No existen datos a actualizar');
    }
    const sequelizeInstance = await getInstancia();
    let errorNegocio = [];
    let finalErrorNeg = null;
    return await sequelizeInstance.transaction(async (t) => {
        for (const elemento of dataArray) {
            console.log('✅ Procesando elemento *', elemento);
            const resultado = await updateRecord(model, elemento, { transaction: t });
            console.log('✅ Reg Actualizado ', resultado);
            if (resultado.errorNeg) {
                errorNegocio = [...errorNegocio, ...resultado.errorNeg];
            }
        }
        if (errorNegocio) {
            finalErrorNeg = errorNegocio.length > 0 ? errorNegocio : null;
        }
        console.log('✅ Bulk Modify correcto');
        const resData = obtContadorReg(errorNegocio, dataArray);
        console.log('✅ Retorno ', resData, finalErrorNeg);
        return { estatus: finalErrorNeg ? kErrorNeg : kCorrecto,
            data: resData, errorUs: null, errorNeg: finalErrorNeg };
    });
}
export async function obtResultado(operacionCallback, ...args) {
    try {
        const kCorrecto = 1;
        const resultado = await operacionCallback(...args);
        return { estatus: kCorrecto, validationErrors: null };
    }
    catch (error) {
        const errorNeg = armaErrorNeg(error);
        return errorNeg;
    }
}
export function armaErrorNeg(error) {
    if (error instanceof ValidationError) {
        console.log('✅Error capturado por armaErrorNeg:', error);
        const kNegPrefix = '[N]:';
        const validationErrors = [];
        let soloNegocio = true;
        error.errors.forEach(err => {
            if (err.message && err.message.startsWith(kNegPrefix)) {
                console.log(`✅- Campo: ${err.path}, Mensaje: ${err.message}, Tipo: ${err.validatorKey}`);
                validationErrors.push(err.message.substring(kNegPrefix.length).trim());
            }
            else {
                soloNegocio = false;
            }
        });
        if (soloNegocio) {
            console.log('✅Solo errores de Negocio');
            return { estatus: kErrorNeg, validationErrors: validationErrors };
        }
        else {
            console.log('✅Errores de sistema');
            throw error; // Prpagación del error para rutina principal de excepciones
        }
    }
    else {
        throw error; // Prpagación del error para rutina principal de excepciones
    }
}
// [{contador : contador}]
export function obtContadorReg(valError, data) {
    let resData;
    if (data) {
        console.log('✅ Entre a dada lenght', data);
        resData = [{ contador: data.length }];
    }
    else
        resData = [{ contador: 1 }];
    ;
    if (valError) {
        if (valError.length > 0) {
            resData = null;
        }
    }
    return resData;
}
/**
 * Convierte una lista de errores personalizados en una instancia de ValidationError de Sequelize.
 *
 * @param errores Lista de objetos con { campo, mensaje }
 * @param instance Instancia del modelo Sequelize donde ocurrió la validación
 * @returns ValidationError listo para lanzar con throw
 */
export function construirErroresValidacion(errores, instance) {
    const validationItems = errores.map((err) => new ValidationErrorItem(err.mensaje, // message
    'validation error', // type
    err.campo, // path
    instance[err.campo], // value
    instance, // instance
    'customValidation', // validatorKey (puede ser genérico)
    'beforeValidateHook', // fnName
    [] // fnArgs
    ));
    return new ValidationError('Errores de validación de negocio', validationItems);
}
