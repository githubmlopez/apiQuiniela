import { Sequelize, Error,  } from 'sequelize';
import { UniqueConstraintError, ForeignKeyConstraintError, DatabaseError, ValidationError} from 'sequelize';
import { I_FC_TAREA_EVENTO, I_CreaObjetoEvento} from '../index.js';
import { Logger} from 'winston';

import { I_ObjError } from '../index.js';

interface SequelizeValidationError extends Error {
    name: 'SequelizeValidationError' | 'SequelizeUniqueConstraintError';
    errors: Array<{ message: string; path?: string; type?: string }>;
}

interface SequelizeDatabaseError extends Error {
    name: 'SequelizeDatabaseError' | 'DatabaseError';
    parent: { message: string; code?: string; sql?: string };
}

export async function createExcepcion(
  data: I_FC_TAREA_EVENTO,
  logger: Logger,
  sequelize: Sequelize
): Promise<void> {
  try {
    //const modelo = await def_FC_TAREA_EVENTO(sequelize);
    const nomModelo = 'FC_TAREA_EVENTO';
    const modelo : any = sequelize.models[nomModelo];
    await modelo.create(data);
  } catch (error: any) {
    console.error('❌ ERROR ', data, error);
    logger.error('Error al insertar registro Excepcion', data);
  }
}

export function crearObjError (error: any, contexto : string) : I_ObjError {
    let msgErrorUs: string = 'Ha ocurrido un error inesperado.';
    let msgErrorSis: string = `Error en el contexto '${contexto}': No se pudo determinar el tipo de error.`;
    let errorStack: string | undefined = undefined; // Changed to undefined for consistency

    console.error('❌ Error capturado por la rutina de excepciones (crearObjError):', error?.constructor?.name || 'Unknown Constructor');
    console.error('❌ Tipo de error (crearObjError):', Object.prototype.toString.call(error));
    console.error('❌ Objeto de error completo (crearObjError):', JSON.stringify(error, Object.getOwnPropertyNames(error)));

    //Intentar obtener el stack trace, si existe.
    if (error && typeof error.stack === 'string') {
    errorStack = error.stack;
  }

// --- Manejo de Errores de Sequelize ---
  if (error instanceof UniqueConstraintError) {
    // Para errores de unicidad, intentamos dar un mensaje sistémico más claro.
    const fields = error.fields ? Object.keys(error.fields).join(', ') : 'desconocido';
    msgErrorSis = `UniqueConstraintError en ${contexto}. Campos duplicados: '${fields}'. Mensaje original de DB: '${error.message}'.`;
    // El mensaje al usuario puede ser un poco más específico aquí si se desea, pero sigue siendo genérico a nivel técnico.
    msgErrorUs = 'Un registro con la información proporcionada ya existe. Por favor, verifique sus datos.'; 
  } else if (error instanceof ForeignKeyConstraintError) {
    msgErrorSis = `ForeignKeyConstraintError en ${contexto}. Detalles: ${error.message}. Referencia: ${error.fields ? JSON.stringify(error.fields) : 'N/A'}.`;
  } else if (error instanceof DatabaseError) {
    // Para otros errores de DB, intentamos capturar el mensaje del error padre (del driver de DB).
    msgErrorSis = `DatabaseError en ${contexto}. Mensaje de Sequelize: '${error.message}'. Mensaje original de DB: '${error.parent?.message || 'N/A'}'. SQL: '${error.sql || 'N/A'}'`;
  } else if (error instanceof ValidationError) {
    // Si un ValidationError llega aquí, se asume que no fue un error de negocio puro.
    // Recopilar todos los mensajes de validación para los logs del sistema.
    const validationDetails = error.errors.map(err => {
      // Intentar obtener el mensaje más relevante de cada item de validación
      const itemMsg = err.message || err.validatorKey || 'Detalle no especificado';
      return `${err.path || 'N/A'}: '${itemMsg}' (Tipo: '${err.type}', Validador: '${err.validatorKey}')`;
    }).join('; ');
    msgErrorSis = `ValidationError (Inesperado/Técnico) en ${contexto}. Detalles: ${validationDetails}. Mensaje general: '${error.message}'.`;
  }
  // --- Manejo de Errores Estándar de JavaScript ---
  else if (error instanceof Error) {
    // Para cualquier instancia de Error (TypeError, ReferenceError, SyntaxError, etc.)
    msgErrorSis = `${error.name || 'Error'} en ${contexto}: '${error.message}'.`;

    // Si es un AggregateError, incluir los mensajes de los errores internos para los logs.
    if (error.name === 'AggregateError' && (error as any).errors && Array.isArray((error as any).errors)) {
      const aggregatedMessages = (error as any).errors.map((e: any) => e.message || 'Error interno sin mensaje').join('; ');
      msgErrorSis += ` Errores agregados: '${aggregatedMessages}'.`;
    }
  }
  // --- Manejo de Errores que no son instancias de Error (ej. string, objeto plano) ---
  else if (typeof error === 'string') {
    msgErrorUs = error;
    msgErrorSis = `Error de tipo string en ${contexto}: '${error}'.`;
  } else {
    // Para cualquier otro tipo, intentar serializarlo para el log.
    try {
      msgErrorSis = `Error desconocido en ${contexto}: ${JSON.stringify(error)}.`;
    } catch (e) {
      // Si la serialización falla (ej. por referencias circulares), proporcionar un mensaje genérico.
      msgErrorSis = `Error desconocido en ${contexto}: No se pudo serializar el objeto. Tipo: ${typeof error}.`;
    }
  }

  return { errorUs: msgErrorUs, errorSis: msgErrorSis, errorStack : errorStack, errNeg : null }

}


export async function crearObjetoEvento( error : any, opciones: I_CreaObjetoEvento, contexto : string)
: Promise<I_FC_TAREA_EVENTO> {
  console.log('✅ Objeto error II', error);
  const infError : I_ObjError = crearObjError(error, contexto)
  const data : I_FC_TAREA_EVENTO  = {
      ID_PROCESO: opciones.ID_PROCESO,
      F_EVENTO: opciones.F_EVENTO,
      ID_EVENTO: opciones.ID_EVENTO,
      CVE_TIPO_EVENTO: opciones.CVE_TIPO_EVENTO !== undefined ? opciones.CVE_TIPO_EVENTO : 'E',
      CVE_APLICACION : opciones.CVE_APLICACION,
      CVE_USUARIO: opciones.CVE_USUARIO,
      DESC_ERROR: infError.errorUs !== undefined ? infError.errorUs : contexto,
      MSG_ERROR: infError.errorSis !== undefined ? infError.errorSis : null,
      ERROR_NUMBER_D: opciones.ERROR_NUMBER_D !== undefined ? opciones.ERROR_NUMBER_D : null,
      ERROR_SEVERITY_D: opciones.ERROR_SEVERITY_D !== undefined ? opciones.ERROR_SEVERITY_D : null,
      ERROR_STATE_D: opciones.ERROR_STATE_D !== undefined ? opciones.ERROR_STATE_D : null,
      ERROR_PROCEDURE_D: opciones.ERROR_PROCEDURE_D !== undefined ? opciones.ERROR_PROCEDURE_D : null,
      ERROR_LINE_D: opciones.ERROR_LINE_D !== undefined ? opciones.ERROR_LINE_D : null,
      ERROR_MESSAGE_D: infError.errorStack !== undefined ? infError.errorStack : null
    };

    return data;
  }

