import { I_ConfCron} from '@modelos/index.js';
import { ejecutaProcCron, obtConfigCron, ejecutaCargaCron } from '@util/index.js';
import { cargaCache} from '@util/index.js';
import { ejecFuncion, setupGlobalError,  creaHeadEsq} from '@util/index.js';
import { I_Header } from '@modelos/index.js';
import { obtenerNoticiasESPN } from '@router/index.js';
const cveAplicacion = 'setGlobalE'
const header : I_Header = creaHeadEsq(cveAplicacion);

await setupGlobalError();
console.log('✅ setupGlobalError');
const contMem = 'Carga inf a Memoria';
await ejecFuncion (cargaCache, header, contMem);
console.log('✅ cargaCache');

export const initCronJobs = async () => {
    try {
        console.log('🚀 Iniciando inicialización de Cron Jobs...');

// Configuración Para calculo de Cierre de Quiniela        

        const kIdCronCierre = 1; 
        let config: I_ConfCron | null = await obtConfigCron(kIdCronCierre); 

        if (!config) {
            console.error(`❌ No se encontró configuración para el ID_CRON: ${kIdCronCierre}.`);
            return;
        }

        console.log('✅ Configuración cargada:', config);
        
        let cronExpression = `${config.cronMinuto} ${config.cronHora} ${config.cronDom} ${config.cronMes} ${config.cronDow}`;
        let kIdProcedure = '13'; 
        let contexto = `Ejecución automática: ${config.descCron}`;

        let monitor = '1';

        await ejecutaProcCron(kIdProcedure, contexto, cronExpression, monitor); 
        
        console.log(`📡 Planificador en espera para: ${config.descCron} (${cronExpression})`);

// Configuración Para calculo de diferencias en Quinielas

        const kIdCronDiferencias = 2; 
        config = await obtConfigCron(kIdCronDiferencias); 

        if (!config) {
            console.error(`❌ No se encontró configuración para el ID_CRON: ${kIdCronDiferencias}.`);
            return;
        }

        console.log('✅ Configuración cargada:', config);
        
        cronExpression = `${config.cronMinuto} ${config.cronHora} ${config.cronDom} ${config.cronMes} ${config.cronDow}`;
        contexto = `Ejecución automática: ${config.descCron}`;

        monitor = '2';

        await ejecutaProcCron(kIdProcedure, contexto, cronExpression,  monitor); 
        
        console.log(`📡 Planificador en espera para: ${config.descCron} (${cronExpression})`);

// Configuración Para Apertura de Quinielas

        const kIdCronAbreQuin = 3; 
        config = await obtConfigCron(kIdCronAbreQuin); 

        if (!config) {
            console.error(`❌ No se encontró configuración para el ID_CRON: ${kIdCronAbreQuin}.`);
            return;
        }

        console.log('✅ Configuración cargada:', config);
        
        cronExpression = `${config.cronMinuto} ${config.cronHora} ${config.cronDom} ${config.cronMes} ${config.cronDow}`;
        contexto = `Ejecución automática: ${config.descCron}`;

        monitor = '3';

        await ejecutaProcCron(kIdProcedure, contexto, cronExpression,  monitor); 
        
        console.log(`📡 Planificador en espera para: ${config.descCron} (${cronExpression})`);

// Configuración Carga de informacion de feed de noticias

        const kIdCarga = 4; 
        config = await obtConfigCron(kIdCarga); 

        if (!config) {
            console.error(`❌ No se encontró configuración para el ID_CRON: ${kIdCronAbreQuin}.`);
            return;
        }

        console.log('✅ Configuración cargada:', config);
        
        cronExpression = `${config.cronMinuto} ${config.cronHora} ${config.cronDom} ${config.cronMes} ${config.cronDow}`;
        contexto = `Ejecución automática: ${config.descCron}`;

        kIdProcedure = '15';

        const jsonInf = await obtenerNoticiasESPN();

        await ejecutaCargaCron(kIdProcedure, contexto, cronExpression, jsonInf); 
        
        console.log(`📡 Planificador en espera para: ${config.descCron} (${cronExpression})`);
    } catch (error) {
        console.error('❌ Error crítico al inicializar Cron Jobs:', error);
    }
        
};

initCronJobs();