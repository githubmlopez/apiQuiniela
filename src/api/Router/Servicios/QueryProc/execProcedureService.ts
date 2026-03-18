import { I_Header, KeyValueObject, I_InfResponse } from '@modelos/index.js';
import { ejecFuncion } from '@util/index.js';
import { ExecProcedure } from '@router/index.js';
import { userContext } from '@middle/index.js';
import { envConfig } from '@config/index.js'; // Importamos config
import { verificarCacheDinamico, guardarCacheDinamico} from '@router/index.js'; // Importamos utilerías de caché

export async function execProcedureService(
    idProcedure: string,
    parmRemp: KeyValueObject
) {
    const header = userContext.getStore() as I_Header;
    const contexto = 'Procedure / Exec (Service)';
    const kinfProc = 'DP';
    
    // 1. Interruptor Maestro
    const usarCache = envConfig.MEM_CACHE;

    // 2. Intento de recuperación de memoria (Usamos 'DP' para procedimientos)
    if (usarCache) {
// ----------------------------------------------------
        console.log(`🔍 [${idProcedure}] Buscando procedimiento en caché...`);
        const resCached = verificarCacheDinamico(kinfProc, idProcedure, parmRemp);
        if (resCached) {
            console.log(`⚡ [${idProcedure}] Respondiendo desde memoria (Cache Hit)`);
            return resCached;
        }
    }

    // 3. Ejecución normal (DB)
    const resData: I_InfResponse = await ejecFuncion(
        ExecProcedure, 
        header, 
        contexto,
        idProcedure, 
        parmRemp,
        header
    );

    // 4. Intento de guardado en memoria (SOLO si el interruptor está ON)
    if (usarCache && resData) {
        console.log(`💾 [${idProcedure}] Guardando resultado del procedimiento en memoria`);
        guardarCacheDinamico(kinfProc, idProcedure, parmRemp, resData);
    }

    console.log(`✅ Procedure ejecutado con éxito (${usarCache ? 'Cache/DB' : 'DB Directo'})`); 
    return resData;
}