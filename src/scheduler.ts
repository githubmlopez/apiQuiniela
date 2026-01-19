import cron from 'node-cron';
import { I_Header} from '@modelos/index.js';
import { ExecProcedure } from '@router/index.js';
import { ejecFuncion } from '@util/index.js';

const kCveAplicacion = 'NFL'
const kEspanol = 'ES';
const kSistemas = 'sistemas'

export const initCronJobs = () => {
    // Tarea Nocturna (ej. 2:00 AM) - Proceso pesado

    const idProcedure = 99;

    const headerCron : I_Header = {
    idProceso  : 99,
    cveAplicacion : kCveAplicacion,
    cveUsuario : kSistemas,
    cveIdioma  : kEspanol,
    cvePerfil  : kSistemas
    }

    const contexto = 'Ejecucion de Cierre de dia';

cron.schedule('0 2 * * *', async () => {
    await ejecFuncion(
        ExecProcedure, 
        headerCron, 
        contexto,
        String(idProcedure), 
        null,
        headerCron
    );
}, { 
    timezone: "America/Mexico_City" 
});

console.log('✅ Planificador de tareas activado');
};