import { I_ConfCron} from '@modelos/index.js';
import { ejecutaProcCron, obtConfigCron } from '@util/index.js';
import { cargaCache} from '@util/index.js';
import { ejecFuncion, setupGlobalError,  creaHeadEsq} from '@util/index.js';
import { I_Header } from '@modelos/index.js';

const cveAplicacion = 'setGlobalE'
const header : I_Header = creaHeadEsq(cveAplicacion);

await setupGlobalError();
console.log('✅ setupGlobalError');
const contMem = 'Carga inf a Memoria';
await ejecFuncion (cargaCache, header, contMem) 
console.log('✅ cargaCache');

export const initCronJobs = async () => {
    try {
        console.log('🚀 Iniciando inicialización de Cron Jobs...');
        
        const kIdCronCierre = 1; 
        const config: I_ConfCron | null = await obtConfigCron(kIdCronCierre); 

        if (!config) {
            console.error(`❌ No se encontró configuración para el ID_CRON: ${kIdCronCierre}.`);
            return;
        }

        console.log('✅ Configuración cargada:', config);
        
        const cronExpression = `${config.cronMinuto} ${config.cronHora} ${config.cronDom} ${config.cronMes} ${config.cronDow}`;
        const kIdProcedure = '13'; 
        const contexto = `Ejecución automática: ${config.descCron}`;

        await ejecutaProcCron(kIdProcedure, contexto, cronExpression); 
        
        console.log(`📡 Planificador en espera para: ${config.descCron} (${cronExpression})`);

    } catch (error) {
        console.error('❌ Error crítico al inicializar Cron Jobs:', error);
    }

  
};

initCronJobs();