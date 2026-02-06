import { I_InfResponse } from '@modelos/index.js';
import { GetCache } from '@util/MemoCache.js';
import { KeyValueObject} from '@modelos/index.js';
import { putCacheData} from '@util/index.js';

export function verificarCacheDinamico(
    tipo: 'DS' | 'DP', 
    id: string, 
    parmRemp: KeyValueObject
    ): I_InfResponse | null {
    const tipoMeta = (tipo === 'DS') ? 'S' : 'P';
    const instCacheMeta = GetCache(tipoMeta);
    const meta: any = instCacheMeta.get(id);
    
    if (meta && meta.bCacheable) {
        // Usamos la función unificada
        const llaveData = generarLlaveDinamica(tipo, id, meta, parmRemp);
        console.log('✅ Busca en cache:', llaveData);
        
        const instCacheDatos = GetCache(tipo);
        const datosEnMemoria: any = instCacheDatos.get(llaveData);

        if (datosEnMemoria) {
            console.log(`⚡ [Cache Hit] Identificador: ${llaveData}`);
            return {
                estatus: 1,
                data: datosEnMemoria,
                errorUs: null,
                errorNeg: null
            };
        }
    }
    return null; 

}

/**
 * Guarda el resultado en la instancia correspondiente si el ID es cacheable.
 */
export function guardarCacheDinamico(
    tipo: 'DS' | 'DP',
    id: string,
    parmRemp: KeyValueObject,
    resData: I_InfResponse
): void {
    const tipoMeta = (tipo === 'DS') ? 'S' : 'P';
    const instCache = GetCache(tipoMeta);
    const meta: any = instCache.get(id);

    if (meta && meta.bCacheable && resData.estatus && resData.data) {
        // Llamada a la función con el nombre correcto
        const llaveData = generarLlaveDinamica(tipo, id, meta, parmRemp);
        
        console.log('✅ Guardando en cache:', llaveData);
        putCacheData(tipo, llaveData, resData.data, meta.timeCache);
    }
}
/*
function generarLlaveDinamica(tipo: string, id: string, meta: any, parmRemp: KeyValueObject): string {
    const campos = meta.llaveConfig ? meta.llaveConfig.split(',') : [];
    const valores = campos.map((c: string) => parmRemp[c.trim()] ?? 'NULL');
    
    // Al usar el spread operator [...valores], evitamos el guion bajo extra
    // Resultado: "DS_ID_VAL1_VAL2" en lugar de "DS_ID__VAL1_VAL2"
    return [tipo, id, ...valores].join('_');
}
*/
function generarLlaveDinamica(tipo: string, id: string, meta: any, parmRemp: KeyValueObject): string {
    // 1. Obtenemos los campos de la configuración
    const campos = meta?.llaveConfig ? meta.llaveConfig.split(',') : [];

    // 2. Mapeamos los valores, pero si no existen devolvemos 'null' o 'undefined' internamente
    const seguroParm = parmRemp ?? {};
    const valoresExtra = campos.map((c: string) => {
        const valores = seguroParm[c.trim()];
        // Solo devolvemos el valor si no es nulo, ni indefinido, ni string vacío
        return (valores !== null && valores !== undefined && valores !== '') ? String(valores) : null;
    });

    // 3. JUNTAMOS TODO Y FILTRAMOS
    // Filtramos los nulos para que no generen "__" ni aparezcan en la llave
    const partesLlave = [tipo, id, ...valoresExtra].filter(parte => parte !== null);

    return partesLlave.join('_');
}