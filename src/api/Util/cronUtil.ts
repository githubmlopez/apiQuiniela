import cron from 'node-cron';
import {I_ConfCron, I_Header, I_InfResponse} from '@modelos/index.js';
import { ejecFuncion} from '@util/index.js';
import { ExecRawQueryById} from '@router/index.js';
import { ExecProcedure } from '@router/index.js';

const kCveAplicacion = 'NFL'
const kEspanol = 'ES';
const kSistemas = 'sistemas';

const headerCron: I_Header = {
idProceso: 99,
cveAplicacion: kCveAplicacion,
cveUsuario: kSistemas,
cveIdioma: kEspanol,
cvePerfil: kSistemas
};
  
export async function obtConfigCron(idCron: number): Promise<I_ConfCron | null> {
    const contexto = 'Configuracion Cron ' + idCron;
    const idQuery = '26'; // Query con la obtencion de parametros
    const parmRemp = { $1: idCron };

    console.log('*** Query ', idQuery, parmRemp)
    const resData: I_InfResponse = await ejecFuncion(
        ExecRawQueryById,
        headerCron,
        contexto,
        idQuery,
        parmRemp
    );

    // 1. Validamos que haya datos y que sea un arreglo con al menos un elemento
    if (!resData.data || resData.data.length === 0) {
        console.warn(`⚠️ No se encontró configuración para ID_CRON: ${idCron}`);
        return null;
    }

    // 2. Tomamos el primer registro del array
    const registro = resData.data[0];

    // 3. Mapeamos el resultado de la DB a la interfaz I_ConfCron
    // Nota: Ajusta los nombres de la derecha (ej. ID_CRON) a como los devuelve tu Query 26
    const resCron: I_ConfCron = {
        idCron     : registro.ID_CRON,
        descCron   : registro.descCron,
        cronMinuto : registro.cronMinuto,
        cronHora   : registro.cronHora,
        cronDom    : registro.cronDom,
        cronMes    : registro.cronMes,
        cronDow    : registro.cronDow
    };

    return resCron;
}

export async function ejecutaProcCron(idProcCron: string, contexto : string, cronExpression : string): Promise<void> {
        console.log('*** Ejecutando Cron' );
        // 3. Programar la tarea con los valores de la DB
        cron.schedule(cronExpression, async () => {
            console.log(`🚀 Iniciando proceso de cierre configurado (${cronExpression})`);
            
            const parmRemp = { $1: 1,  $2: 0};

            await ejecFuncion(
                ExecProcedure, 
                headerCron, 
                contexto,
                idProcCron,
                parmRemp,
                headerCron
            );
        }, { 
            timezone: "America/Mexico_City" 
        });

        console.log(`✅ Planificador activado para: ${cronExpression} (CDMX)`);
    }