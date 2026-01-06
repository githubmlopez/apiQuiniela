import { ValidationError, ValidationErrorItem } from 'sequelize';
import { getInstancia } from '../../index.js';
import { findOneByKeyService, buildPKWhereClause } from '../Servicios/CRUD/index.js';
const kCorrecto = 1;
const kErrorNeg = 3;
// Function to generate the where clause for findOne based on primary keys
/*
  export async function createRecord <M extends Model>(
    model: typeof Model & (new () => M),
    data: any,
    opciones?: { transaction?: Transaction }
  ): Promise<I_InfResponse> {
    console.log(data);
    console.log(model.primaryKeyAttributes);
    const existingRecord : M | null = await findOneByKeyService(model, data);

    if (existingRecord) {
      // throw ('Registro ya existe ' + model.name);
      return {
      estatus: kErrorNeg,
      data: null,
      errorUs: null,
      errorNeg: ['Registro ya existe']
      }
      } else {
      const createOptions = {
            ...opciones, // Mantiene la transacción u otras opciones
            individualHooks: true
        }
      const resultado : I_OperaResult = await obtResultado(
      async (model: any, data: any, createOpts: any) => {
      const instance = await model.create(data, createOpts);
      return instance;
      },
      model,
      data,
      opciones,
      createOptions
    );
    const resData : any  = obtContadorReg (resultado.validationErrors);
    return {estatus : resultado.estatus,
    data : resData,
    errorUs: null,
    errorNeg : resultado.validationErrors as string[] | null};
    }
  }
*/
export async function createRecord(model, data, opciones) {
    console.log(data);
    console.log(model.primaryKeyAttributes);
    const hasTriggers = model.options?.hasTriggers || false;
    console.log('🚨 hasTriggers ', hasTriggers);
    const existingRecord = await findOneByKeyService(model, data, {
        transaction: opciones?.transaction // 🌟 CRÍTICO: Debe ir dentro de la transacción); 
    });
    if (existingRecord) {
        // Lógica de error cuando el registro existe (consistente con su código)
        return {
            estatus: kErrorNeg,
            data: null,
            errorUs: null,
            errorNeg: ['Registro ya existe']
        };
    }
    else {
        // 1. Crear el objeto de opciones, añadiendo individualHooks: true
        const createOptions = {
            ...opciones,
            individualHooks: true,
            hooks: true,
            returning: hasTriggers ? false : true,
            hasTriggers: hasTriggers,
            raw: false
        };
        // 2. Ejecutar la creación con obtResultado
        const resultado = await obtResultado(async (model, datosCreacion, createOpts) => {
            // model.create devuelve la instancia del modelo creada (M)
            const instance = await model.create(datosCreacion, createOpts);
            // 🌟 Se devuelve 1 para indicar éxito.
            return 1;
        }, model, data, // Pasamos los datos
        createOptions // Pasamos el objeto de opciones
        );
        // 3. Procesar el resultado final (similar al update)
        if (resultado.estatus === kCorrecto) {
            const filasCreadas = resultado.data;
            // Asumimos que si estatus es 1, la creación fue exitosa (1 registro afectado)
            // Devolvemos el contador 1 (consistente con la respuesta del update)
            return {
                estatus: resultado.estatus,
                data: [{ contador: filasCreadas }],
                errorUs: null,
                errorNeg: null
            };
        }
        else {
            // Si el estatus no es 1, hubo un error de validación capturado por obtResultado
            return {
                estatus: resultado.estatus,
                data: null,
                errorUs: null,
                errorNeg: resultado.validationErrors
            };
        }
    }
}
/*
export async function updateRecord <M extends Model> (
  model: typeof Model & (new () => M),
  data: any,
  opciones?: { transaction?: Transaction }
): Promise<I_InfResponse> {
  console.log('✅ Procesando elemento U ', model, data);
  console.log(model.primaryKeyAttributes);
  const existingRecord : M | null = await findOneByKeyService(model, data);
  if (existingRecord) {
    const whereClause = buildPKWhereClause (model, data);
    const resultado : I_OperaResult = await obtResultado (
    async (model: any, data: any, opciones?: { transaction?: Transaction }) => {
    const instance = await model.update(data, {
    where: whereClause,
    individualHooks: true,   // 🔥 activa validaciones y hooks
    ...opciones // se usa spreed operator porque necesitas "mezclar" las opciones recibidas (como la transacción)
    //  con opciones locales obligatorias (como el where del update).
    });
    return instance;
    },
    model,
    data,
    opciones
  );
  const resData : any  = obtContadorReg (resultado.validationErrors);
  return {estatus : kCorrecto, data : resData, errorUs: null, errorNeg : resultado.validationErrors as string[] | null};
  } else {
    return {
    estatus: kErrorNeg,
    data: null,
    errorUs: null,
    errorNeg: ['Registro a actualizar no existe']
    }
  }
}
*/
export async function updateRecord(model, data, // Los datos de entrada contienen los campos a actualizar y las PKs
opciones // Aseguramos que la transacción esté disponible
) {
    console.log('✅ Update Data   **** ', data);
    // 1. Verificar la existencia del registro (usando la PK de 'data')
    const hasTriggers = model.options?.hasTriggers || false;
    const existingRecord = await findOneByKeyService(model, data, {
        transaction: opciones?.transaction // 🌟 CRÍTICO: Debe ir dentro de la transacción); 
    });
    if (existingRecord) {
        // Si existe, construimos la cláusula WHERE usando las claves primarias (PKs)
        const whereClause = buildPKWhereClause(model, data);
        // 2. Construir el objeto de opciones para la actualización
        // Esto garantiza que:
        // a) Las opciones originales (ej. transaction) se preserven (...opciones).
        // b) Se añada individualHooks: true.
        // c) Se añada la cláusula WHERE.
        const updateOptions = {
            ...opciones,
            individualHooks: true, // 🌟 Incorporar individualHooks: true
            returning: hasTriggers ? false : true,
            hasTrigger: hasTriggers,
            raw: false,
            where: whereClause, // 🌟 CRÍTICO: Incluir la cláusula WHERE
            validateOnlyChanged: true // No es una variable de sequelize se implemento para indicar actualizacion  
        };
        // 3. Ejecutar la actualización con obtResultado
        const resultado = await obtResultado(async (model, datosActualizacion, updateOpts) => {
            // model.update devuelve un array [número_de_filas_afectadas, instancias_actualizadas]
            // Si la actualización es exitosa, el primer elemento es > 0.
            console.log('✅ Update Data COMMAND   **** ', data);
            const updateResult = await model.update(datosActualizacion, updateOpts);
            console.log('✅ Sale de Update Data COMMAND   **** ', data);
            // Sequelize devuelve [filasAfectadas, instancias], aquí solo regresamos filasAfectadas
            return updateResult[0];
        }, model, // Primer argumento de la función interna: el modelo
        data, // Segundo argumento de la función interna: los datos a actualizar
        updateOptions // Tercer argumento de la función interna: las opciones (incluyendo WHERE y hooks)
        );
        // 4. Procesar el resultado (resultado.data contendrá el número de filas afectadas)
        if (resultado.estatus === kCorrecto) {
            const filasEliminadas = resultado.data;
            return {
                estatus: resultado.estatus,
                data: [{ contador: filasEliminadas }],
                errorUs: null,
                errorNeg: null
            };
        }
        else {
            // Este caso es poco probable porque ya verificamos la existencia, 
            // pero podría ocurrir si no hay cambios en los datos.
            return {
                estatus: resultado.estatus,
                data: null,
                errorUs: null,
                errorNeg: resultado.validationErrors
            };
        }
    }
    else {
        // Registro no existe
        return {
            estatus: kErrorNeg,
            data: null,
            errorUs: null,
            errorNeg: ['Registro no existe']
        };
    }
}
/*
export async function deleteRecord <M extends Model>(
  model: typeof Model & (new () => M),
  data: any,
  opciones?: { transaction?: Transaction }
): Promise<I_InfResponse> {
  console.log(data);
  console.log(model.primaryKeyAttributes);
    const existingRecord : M | null = await findOneByKeyService(model, data);
  if (existingRecord) {
    const whereClause = buildPKWhereClause (model, data);
    const resultado : I_OperaResult = await obtResultado(
    async (opciones?: { transaction?: Transaction }) => {
      const instance = await model.destroy({
      where: whereClause,
      ...opciones
      });
      return instance;
    },
    existingRecord,
    opciones
  );

  const resData : any  = obtContadorReg (resultado.validationErrors);
  return {estatus : kCorrecto, data : resData, errorUs: null, errorNeg : resultado.validationErrors as string[] | null};
  } else {
  return {
    estatus: kErrorNeg,
    data: null,
    errorUs: null,
    errorNeg: ['Registro a borrar no existe']
    }
}
}
*/
export async function deleteRecord(model, data, // Los datos de entrada contienen las PKs para eliminar
opciones) {
    console.log(data);
    console.log(model.primaryKeyAttributes);
    // Asumimos kErrorNeg y kCorrecto están definidos globalmente o importados
    const kCorrecto = 1;
    const hasTriggers = model.options?.hasTriggers || false;
    // 1. Verificar la existencia del registro (usando la PK de 'data')
    const existingRecord = await findOneByKeyService(model, data, {
        transaction: opciones?.transaction // 🌟 CRÍTICO: Debe ir dentro de la transacción); 
    });
    if (existingRecord) {
        const whereClause = buildPKWhereClause(model, data);
        // 2. Construir el objeto de opciones para la eliminación
        // Solamente se necesita la transacción y la cláusula WHERE.
        const deleteOptions = {
            ...opciones, // Preservar la transacción
            where: whereClause, // CRÍTICO: Incluir la cláusula WHERE
            returning: hasTriggers ? false : true,
            // NOTA: Se omite individualHooks: true, según su requerimiento.
        };
        // 3. Ejecutar la eliminación con obtResultado
        const resultado = await obtResultado(async (deleteOpts) => {
            // model.destroy devuelve el número de filas eliminadas (0 o 1)
            const filasEliminadas = await model.destroy(deleteOpts);
            return filasEliminadas; // Devolvemos el número de filas afectadas
        }, 
        // 🌟 NOTA DE CONSISTENCIA: Eliminamos el argumento 'existingRecord' ya que no se usa.
        // La función interna solo necesita las opciones de eliminación.
        deleteOptions);
        // 4. Procesar el resultado (resultado.data contendrá el número de filas afectadas)
        const filasEliminadas = resultado.data;
        if (resultado.estatus === kCorrecto) {
            if (filasEliminadas > 0) {
                return {
                    estatus: resultado.estatus,
                    data: [{ contador: filasEliminadas }],
                    errorUs: null,
                    errorNeg: null
                };
            }
            else {
                // Caso donde la verificación inicial falló, o el registro fue eliminado por fuera.
                return {
                    estatus: kErrorNeg, // Error de negocio, se esperaba que existiera
                    data: null,
                    errorUs: null,
                    errorNeg: ['Registro no eliminado']
                };
            }
        }
        else {
            // Si obtResultado falló (ej. error de base de datos)
            return {
                estatus: kErrorNeg,
                data: null,
                errorUs: null,
                errorNeg: ['Error al procesar la eliminación.']
            };
        }
    }
    else {
        // Registro no existe
        return {
            estatus: kErrorNeg,
            data: null,
            errorUs: null,
            errorNeg: ['Registro no existe']
        };
    }
}
export async function bulkCreateRecords(model, dataArray) {
    let filasCreadas = 0;
    if (!Array.isArray(dataArray) || dataArray.length === 0) {
        throw ('No existen datos a crear');
    }
    const sequelizeInstance = await getInstancia();
    let errorNegocio = [];
    try {
        // 1. Iniciamos la transacción gestionada
        return await sequelizeInstance.transaction(async (t) => {
            // 2. Iteramos cada elemento igual que en tu bulkUpdate
            for (const elemento of dataArray) {
                // Llamamos a tu createRecord pasándole la transacción actual
                const resultado = await createRecord(model, elemento, { transaction: t });
                if (resultado.errorNeg && resultado.errorNeg.length > 0) {
                    // Si hay errores de negocio, los acumulamos
                    errorNegocio = [...errorNegocio, ...resultado.errorNeg];
                }
                else {
                    // Si fue exitoso, sumamos al contador
                    filasCreadas++;
                }
            }
            // 3. 🚨 EVALUACIÓN DE ERRORES ACUMULADOS
            // Si hubo algún error en cualquiera de los registros, forzamos ROLLBACK
            if (errorNegocio.length > 0) {
                const errNegocioObj = new Error('BUSINESS_ERRORS');
                errNegocioObj.isBusiness = true;
                errNegocioObj.detalles = errorNegocio;
                throw errNegocioObj; // Sequelize hace Rollback de TODO automáticamente
            }
            // 4. Si todo salió bien, devolvemos éxito y Sequelize hace COMMIT
            return {
                estatus: kCorrecto,
                data: [{ contador: filasCreadas }],
                errorUs: null,
                errorNeg: null
            };
        });
    }
    catch (error) {
        // 🛡️ CAPTURA DE ERRORES (Misma lógica que tu Update)
        if (error.isBusiness) {
            return {
                estatus: kErrorNeg,
                data: [{ contador: 0 }],
                errorUs: null,
                errorNeg: error.detalles
            };
        }
        // Si es un error de sistema (SQL crash), lo relanzamos
        throw error;
    }
}
export async function bulkUpdateRecords(model, dataArray) {
    let filasModificadas = 0;
    if (!Array.isArray(dataArray) || dataArray.length === 0) {
        throw ('No existen datos a actualizar');
    }
    const sequelizeInstance = await getInstancia();
    let errorNegocio = [];
    try {
        return await sequelizeInstance.transaction(async (t) => {
            for (const elemento of dataArray) {
                const resultado = await updateRecord(model, elemento, { transaction: t });
                if (resultado.errorNeg) {
                    errorNegocio = [...errorNegocio, ...resultado.errorNeg];
                }
                else {
                    filasModificadas++;
                }
            }
            // 🚨 SI HAY ERRORES DE NEGOCIO, LANZAMOS EXCEPCIÓN PARA FORZAR ROLLBACK
            if (errorNegocio.length > 0) {
                const errNegocioObj = new Error('BUSINESS_ERRORS');
                errNegocioObj.isBusiness = true;
                errNegocioObj.detalles = errorNegocio;
                throw errNegocioObj;
            }
            return {
                estatus: kCorrecto,
                data: [{ contador: filasModificadas }],
                errorUs: null,
                errorNeg: null
            };
        });
    }
    catch (error) {
        // 🛡️ CAPTURAMOS EL ERROR AQUÍ MISMO PARA QUE NO LLEGUE A EJECFUNCION
        if (error.isBusiness) {
            return {
                estatus: kErrorNeg,
                data: [{ contador: 0 }],
                errorUs: null,
                errorNeg: error.detalles
            };
        }
        // Si es un error de sistema (SQL crash), lo relanzamos para que ejecFuncion lo atrape
        throw error;
    }
}
export async function obtResultado(operacionCallback, ...args) {
    try {
        const data = await operacionCallback(...args);
        return { estatus: kCorrecto, validationErrors: null, data };
    }
    catch (error) { // 1. Añadimos :any para que TS no sufra
        // 2. Manejo del error específico de Sequelize + MSSQL Triggers
        //      -----------------------------------------------------------------------
        if (error instanceof TypeError && error.message.includes("reading 'id'")) {
            console.log("✅ Registro insertado exitosamente (Trigger ejecutado)");
            return {
                estatus: kCorrecto,
                validationErrors: null,
                data: 1
            };
        }
        //      -----------------------------------------------------------------------
        // 3. TODO el manejo de errores debe estar dentro de las llaves del catch
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
            return { estatus: kErrorNeg, validationErrors: validationErrors, data: 0 };
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
/*
export function obtContadorReg (valError : string[] | null | undefined, data? : any) : Record<string, number>[] | null {
  let resData : Record<string, number>[] | null;
  if (data) {
    console.log('✅ Entre a dada lenght', data);
    resData = [{contador : data.length}];
  } else
    resData = [{contador : 1}];;

  if (valError) {
    if (valError.length > 0) {
      resData = null;
    }
  }
  return resData;
}
*/
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
