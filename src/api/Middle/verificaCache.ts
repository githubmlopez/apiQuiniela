import { Request, Response, NextFunction } from 'express';
import { BorraCache} from '@util/index.js';
import { envConfig } from '@config/index.js';
import { I_Header} from '@modelos/index.js';
import { ejecFuncion} from '@util/index.js';

export async function verificaCache(req: Request, res: Response, next: NextFunction): Promise<void> {
    const kErrorAut = 2;
    const usarCache = envConfig.MEM_CACHE;

    // 1. Salida temprana si el caché está desactivado o no hay qué borrar
    if (!usarCache || (req.body?.model == null && req.body?.idProcedure == null)) {
        return next();
    }

    const header: I_Header = {
        idProceso: req.body.idProceso ?? 9999,
        cveAplicacion: req.datosUsuario?.cveAplicacion ?? 'SISTEMA',
        cveUsuario: req.datosUsuario?.cveUsuario ?? 'SISTEMA',
        cveIdioma: req.datosUsuario?.cveIdioma ?? 'ES',
        cvePerfil: req.datosUsuario?.cvePerfil ?? 'SISTEMA'
    };

    const contexto = 'Middleware Limpieza de Cache';

    try {
        // 2. Ejecutamos la lógica de borrado mediante el lanzador
        await ejecFuncion(
            procesarBorradoCache,
            header,
            contexto,
            req
        );

        return next();

    } catch (errorDesc: any) {
        /**
         * Si BorraCache falla (ej. problemas de conexión con Redis o memoria),
         * ejecFuncion ya registró el error. Aquí respondemos con el mensaje
         * amigable procesado por crearObjError.
         */
        return void res.status(401).json({
            estatus: kErrorAut,
            data: null,
            errorUs: errorDesc, 
            errorNeg: null
        });
    }
}

async function procesarBorradoCache(req: Request): Promise<void> {
    const modeloBody = req.body?.model;
    const procBody = req.body?.idProcedure;

    let id: string = '';
    let tipo: 'M' | 'P' = 'M';

    if (modeloBody != null) {
        id = String(modeloBody).trim();
        tipo = 'M';
    } else if (procBody != null) {
        id = String(procBody).trim();
        tipo = 'P';
    }

    if (id) {
        console.log(`🧹 Ejecutando BorraCache - Tipo: ${tipo}, ID: ${id}`);
        await BorraCache(tipo, id);
    }
}

