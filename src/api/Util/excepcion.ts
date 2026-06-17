import { Sequelize, Error } from 'sequelize';
import { UniqueConstraintError, ForeignKeyConstraintError, DatabaseError, ValidationError } from 'sequelize';
import { I_FC_TAREA_EVENTO, I_CreaObjetoEvento, I_ObjError } from '@modelos/index.js';
import { Logger } from 'winston';

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


export function crearObjError(error: any, contexto: string): I_ObjError {
    // 0. Guarda inicial por si el error es null/undefined
    if (!error) {
        return { 
            errorUs: 'Error desconocido.', 
            errorSis: `Se llamó a crearObjError con un objeto nulo en ${contexto}`, 
            errorStack: undefined, 
            errNeg: null 
        };
    }

    let msgErrorUs: string = 'Ha ocurrido un error inesperado.';
    let msgErrorSis: string = `Error en el contexto '${contexto}': No se pudo determinar el tipo de error.`;
    let errorStack: string | undefined = error.stack; // Simplificado

    // 1. Log técnico (con seguridad sobre el nombre)
    const nombreError = error.name || error.constructor?.name || 'Error';
    console.error(`❌ Error en [${contexto}]: ${nombreError}`);

    // --- 2. Cascada de Validación ---

    // A. Sequelize: Unicidad (Duplicados)
    if (error instanceof UniqueConstraintError) {
        // Aseguramos que fields sea un objeto para Object.keys
        const campos = error.fields && typeof error.fields === 'object' 
            ? Object.keys(error.fields).join(', ') 
            : 'desconocido';
        msgErrorSis = `UniqueConstraintError en ${contexto}. Duplicado en: '${campos}'.`;
        msgErrorUs = 'Ya existe un registro con esta información.';
    } 
    // B. Sequelize: Llaves Foráneas
    else if (error instanceof ForeignKeyConstraintError) {
        msgErrorSis = `ForeignKeyConstraintError en ${contexto}. Índice: ${error.index || 'N/A'}. Tabla: ${error.table || 'N/A'}.`;
        msgErrorUs = 'No se puede guardar porque un dato relacionado no existe o está en uso.';
    } 
    // C. Sequelize: Validación de campos (AllowNull: false, etc)
    else if (error instanceof ValidationError) {
        const validationDetails = error.errors?.map(err => `${err.path}: ${err.message}`).join('; ') || error.message;
        msgErrorSis = `ValidationError en ${contexto}: ${validationDetails}`;
        msgErrorUs = 'La información enviada tiene un formato incorrecto.';
    }
    // D. Sequelize: Error General de DB (Sintaxis SQL, etc)
    else if (error instanceof DatabaseError) {
        msgErrorSis = `DatabaseError en ${contexto}: ${error.parent?.message || error.message}. SQL: ${error.sql}`;
    }
    // E. JWT: Sesiones (Seguro por nombre)
    else if (error.name === 'TokenExpiredError' || error.name === 'JsonWebTokenError' || error.name === 'NotBeforeError') {
        const esExpirado = error.name === 'TokenExpiredError';
        msgErrorSis = `JWT Error [${error.name}] en ${contexto}: ${error.message}`;
        msgErrorUs = esExpirado ? 'Tu sesión ha expirado.' : 'Sesión inválida. Por favor, ingresa de nuevo.';
        // Retorno temprano porque es un error de seguridad
        return { errorUs: msgErrorUs, errorSis: msgErrorSis, errorStack, errNeg: null };
    }
    // F. Errores estándar de JS u otros
    else if (error instanceof Error) {
        msgErrorSis = `${error.name} en ${contexto}: ${error.message}`;
        
        // Soporte para AggregateError
        if (error.name === 'AggregateError' && (error as any).errors) {
            const innerErrors = (error as any).errors.map((e: any) => e.message).join(' | ');
            msgErrorSis += ` [Internos: ${innerErrors}]`;
        }
    }
    // G. Fallback para strings o tipos primitivos
    else if (typeof error === 'string') {
        msgErrorUs = error;
        msgErrorSis = `Error (string) en ${contexto}: ${error}`;
    } 
    else {
        try {
            msgErrorSis = `Error no clasificado en ${contexto}: ${JSON.stringify(error)}`;
        } catch {
            msgErrorSis = `Error no clasificado/serializable en ${contexto}. Tipo: ${typeof error}`;
        }
    }

    return { errorUs: msgErrorUs, errorSis: msgErrorSis, errorStack, errNeg: null };
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

