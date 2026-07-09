/*
import { Sequelize} from 'sequelize';
import { def_FC_TAREA_EVENTO, def_Q_PARTIDO, def_Q_SURVIVOR } from '@modelos/index.js';
import { def_Q_QUINIELA } from '@modelos/index.js';
import { def_FC_FOLIO } from '@modelos/index.js';
import { def_FC_SEG_USUARIO, def_Q_QUIN_PARTICIPANTE } from '@modelos/index.js';
import { getInstancia } from '@config/index.js';
import { def_Q_USUARIO } from '@modelos/index.js';
import { def_IN_PRUEBA } from '@modelos/index.js';
import { def_FC_SEG_PASS_RESET } from '@modelos/index.js';

export async function cargaModelos () : Promise<void> {

    const sequelize : Sequelize = await getInstancia();
    
    await def_FC_TAREA_EVENTO(sequelize);

    await def_FC_FOLIO(sequelize);
    await def_FC_SEG_PASS_RESET(sequelize);
    await def_FC_SEG_USUARIO(sequelize);
    await def_Q_QUIN_PARTICIPANTE(sequelize);
    await def_Q_USUARIO(sequelize);
    await def_Q_SURVIVOR(sequelize);
    await def_Q_PARTIDO(sequelize);
    await def_IN_PRUEBA(sequelize);
    await def_Q_QUINIELA(sequelize);

 }
*/

import { Sequelize } from 'sequelize';
import { getInstancia } from '@config/index.js';
import { envConfig } from '@config/index.js';

import { def_FC_SEG_USUARIO } from '../Modelos/Modelo/COMUN/index.js';

// 1. Carga ÚNICAMENTE lo que está en la carpeta COMUN
async function cargarModelosComunes(sequelize: Sequelize): Promise<void> {
    // Apuntamos directo al subdirectorio, ignorando el index general de modelos
    const { 
        def_FC_TAREA_EVENTO, 
        def_FC_FOLIO, 
        def_FC_SEG_PASS_RESET, 
        def_FC_SEG_USUARIO,
    } = await import('../Modelos/Modelo/COMUN/index.js'); 
    await def_FC_TAREA_EVENTO(sequelize);
    await def_FC_FOLIO(sequelize);
    await def_FC_SEG_PASS_RESET(sequelize);
    await def_FC_SEG_USUARIO(sequelize);

}

// 2. Carga ÚNICAMENTE lo que está en la carpeta NFLQUIN
async function cargarModelosQuiniela(sequelize: Sequelize): Promise<void> {
    const { 
        def_Q_QUIN_PARTICIPANTE, 
        def_Q_USUARIO, 
        def_Q_SURVIVOR, 
        def_Q_PARTIDO, 
        def_IN_PRUEBA, 
        def_Q_QUINIELA 
    } = await import('../Modelos/Modelo/NFLQUIN/index.js'); 

    await def_Q_QUIN_PARTICIPANTE(sequelize);
    await def_Q_USUARIO(sequelize);
    await def_Q_SURVIVOR(sequelize);
    await def_Q_PARTIDO(sequelize);
    await def_IN_PRUEBA(sequelize);
    await def_Q_QUINIELA(sequelize);
}

// 3. Carga ÚNICAMENTE lo que está en la carpeta CONDOM
async function cargarModelosCondom(sequelize: Sequelize): Promise<void> {
    const { 
        def_CI_ARCH_MOV_BANC, 
        def_CI_CTRL_CARGA_MOVTOS, 
    } = await import('../Modelos/Modelo/ADCONDOM/index.js'); 

    await def_CI_ARCH_MOV_BANC(sequelize);
    await def_CI_CTRL_CARGA_MOVTOS(sequelize);
    
}

// 4. Orquestador Principal
export async function cargaModelos(): Promise<void> {
    const sequelize: Sequelize = await getInstancia();
    const sistema = envConfig.SISTEMA;

    // A) Los comunes se cargan siempre, sin importar el entorno
    await cargarModelosComunes(sequelize);

    // B) Carga selectiva por entorno
    switch (sistema) {
        case 'quiniela':
            await cargarModelosQuiniela(sequelize);
            break;
            
        case 'condom':
            await cargarModelosCondom(sequelize);
            break;
            
        default:
            console.warn(`[Advertencia]: APP_SISTEMA '${sistema}' no reconocido. Solo se cargaron modelos COMUNES.`);
            break;
    }
}