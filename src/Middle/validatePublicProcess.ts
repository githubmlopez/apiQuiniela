import { Request, Response, NextFunction } from 'express';
import { authenticateToken} from '@middle/index.js';
import { GetCache } from '@util/MemoCache.js';
import { I_Header} from '@modelos/index.js';
import { ejecFuncion} from '@util/index.js';
import { AsyncLocalStorage } from 'async_hooks';
/*
export async function validatePublicProcess(req: Request, res: Response, next: NextFunction) : Promise<void>{
// Bloque de codigo para validar si es una ruta publica
    try {
        if (req.body.hasOwnProperty('idProceso')) {
            const idQuery = req.body.idProceso;
            const kProceso = 'P';
            const instCache = GetCache(kProceso); 
            const meta: any = instCache.get(idQuery);

            if (meta && meta.bPublico) {
                console.log('🌐 Proceso Público Detectado:', idQuery);
                return runPublicContext(idQuery, req, next);
            }
        }
    } catch (error) {
        const kErrorAut = 2;
        console.error('❌ Error en validación pública:', error);
        return void res.status(401).json({
            estatus: kErrorAut,
            errorUs: 'Error al validar acceso público',
            errorNeg: null
        });
    }

    // Si no fue público, procedemos a la autenticación normal por Token
    return authenticateToken(req, res, next);
}
*/

export const userContext = new AsyncLocalStorage<I_Header>();

export async function validatePublicQuery(req: Request, res: Response, next: NextFunction): Promise<void> {
    console.log('✅ Valor Proceso ', req.body.idProceso );
    const kErrorAut = 2
    const header: I_Header = {
        idProceso: req.body.idProceso ?? 9999,
        cveAplicacion: 'PUBLICO',
        cveUsuario: 'GUEST',
        cveIdioma: 'ES',
        cvePerfil: 'GUEST'
    };
    let contexto = 'Middleware Proceso Publico';

    try {
        // 1. Validamos si es un proceso público usando el lanzador
        console.log('✅ Lanzando verificacion publica');
        const esPublico = await ejecFuncion(
            checkIsPublicProcess, 
            header, 
            contexto, 
            req
        );
        console.log('✅ Pregunta si es publico para crear contexto', esPublico);
        if (esPublico) {
            // 2. Ejecutamos contexto público (GUEST)
            return await ejecFuncion(
                runPublicContext, 
                header, 
                contexto, 
                req.body.idProceso, 
                req, 
                next
            );
        }

        // 3. Si no es público, procedemos a autenticación por Token
        contexto = 'Autenticacion de Token';
        return await ejecFuncion(
            authenticateToken, 
            header, 
            contexto, 
            req,    
            res, 
            next
        );

    } catch (errorDesc: any) {
        /**
         * Si llegó aquí es porque:
         * a) Falló el acceso a la caché.
         * b) Falló el token (Expirado o Inválido).
         * El error ya fue registrado en DB por ejecFuncion.
         */
        return void res.status(401).json({
            estatus: kErrorAut,
            data: null,
            errorUs: errorDesc, // Mensaje amigable (ej: "Tu sesión ha expirado.")
            errorNeg: null
        });
    }
}

async function checkIsPublicProcess(req: Request): Promise<boolean> {
    const idQuery = req.body.idProcedure;
    console.log('✅ Valor id Procedure', idQuery);
    if (!idQuery) return false;

    const kProcedure = 'P';
    const instCache = GetCache(kProcedure); 
    const meta: any = instCache.get(idQuery);
    console.log('✅ Valor en Memoria', meta);

    if (meta && meta.bPublico) {
        console.log('🌐 Proceso Público Detectado:', idQuery);
        return true;
    }
    return false;
}

export async function validatePublicProcess(req: Request, res: Response, next: NextFunction) {

    const kErrorAut = 2
    console.log('✅ Valor Proceso ', req.body.idProceso );
    const header: I_Header = {
        idProceso: req.body.idProceso ?? 9999,
        cveAplicacion: 'PUBLICO',
        cveUsuario: 'GUEST',
        cveIdioma: 'ES',
        cvePerfil: 'GUEST'
    };
    let contexto = 'Middleware Validacion Publica';

    try {
        // 1. Validamos si el proceso es público (Consultamos Caché)
        const esPublico = await ejecFuncion(
            checkIsPublic,
            header,
            contexto,
            req
        );
        if (esPublico) {
            // 2. Si es público, ejecutamos el contexto GUEST
            return await ejecFuncion(
                runPublicContext,
                header,
                'Ejecucion Contexto Publico',
                req.body.idProceso,
                req,
                next
            );
        }

        // 3. Si no es público, procedemos a autenticación de Token
        contexto = 'Autenticacion de Token';

        return await ejecFuncion(
            authenticateToken,
            header,
            contexto,
            req,
            res,
            next
        );

    } catch (errorDesc: any) {
        /**
         * EXPLICACIÓN:
         * Al llegar aquí, 'ejecFuncion' ya capturó el error original de JWT,
         * lo pasó por 'crearObjError', registró en DB y lanzó el 'msgErrorUs'.
         * Por lo tanto, 'errorDesc' ya contiene: "Tu sesión ha expirado." o "Sesión inválida."
         */

        return res.status(401).json({
            estatus: kErrorAut,
            data: null,
            errorUs: errorDesc, // El mensaje amigable que viene de la rutina centralizada
            errorNeg: null      // Tal como definiste en crearObjError
        });
    }
}

async function checkIsPublic(req: Request): Promise<boolean> {
    let idQuery = null;
    let tipo    = null;
    const kSql  = 'S';
    const kProcedure = 'P';
    const kProcCrud  = 9999;
    const kCrudProc  = 1000;

    if (req.body.hasOwnProperty('idQuery')) {
        tipo = kSql;
        idQuery = req.body.idQuery;
    }  else {
        idQuery = req.body.idProcedure;
        tipo = kProcedure;
    }
    if (req.body.idProceso === kProcCrud) {
        idQuery = kCrudProc;
        tipo = kProcedure;            
    }   
    console.log(' idQuery check ', idQuery )
    if (!idQuery) return false;
    const instCache = GetCache(tipo);
    const meta: any = instCache.get(idQuery);

    if (meta && meta.bPublico) {
        (req as any).metaPublico = meta; 
        return true;
    }
    return false;
}

export const runPublicContext = (idProceso: any, req: Request, next: NextFunction) => {
    const datosGuest = {
        cveAplicacion: 'PUBLICO',
        cveUsuario   : 'GUEST',
        cveIdioma    : 'ES',
        cvePerfil    : 'GUEST'
    };

    // 1. Seteamos en el request para compatibilidad
    req.datosUsuario = datosGuest;

    // 2. Preparamos el Header para el AsyncLocalStorage
    const header: I_Header = {
        idProceso: idProceso ?? 9999,
        ...datosGuest
    };

    console.log(`🌐 Ejecutando contexto público para proceso: ${idProceso}`);

    // 3. Ejecutamos el siguiente middleware dentro del contexto
    return userContext.run(header, () => {
        next();
    });
};


