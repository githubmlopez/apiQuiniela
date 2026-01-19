import { getInstancia } from '@config/index.js';
import { Sequelize} from 'sequelize';
import { findOneByKeyService} from '@router/index.js';
import { ejecFuncion, creaHeadEsq} from '@util/index.js';
import { ExecRawQueryById} from '@router/index.js';

import { I_Header, I_InfResponse, I_FC_SEG_USUARIO} from '@modelos/index.js';

const kCorrecto = 1;
const kInfUsuario = '5';
/*
export async function getMe(idProceso: number, cveAplicacion : string, cveUsuario : string) : Promise<any> {
   console.log('✅ getMe', idProceso, cveUsuario);
   const sequelize : Sequelize = await getInstancia();
   const header : I_Header = creaHeadEsq(cveAplicacion);
   header.idProceso = idProceso;
   header.cveAplicacion = cveAplicacion;
   header.cveUsuario = cveUsuario;
   const data = 
   {
      CVE_USUARIO : cveUsuario
   };

   const nomModelo = 'FC_SEG_USUARIO';
   const contexto = 'Proceso login';
   const model : any = sequelize.models[nomModelo];

   type FindUserFunction = (...args: any[]) => Promise<I_FC_SEG_USUARIO | null>;

   const resData : I_FC_SEG_USUARIO | null = await ejecFuncion<FindUserFunction>
    (
        // Función a ejecutar
        findOneByKeyService, 
        // Parámetros de ejecFuncion
        header, 
        contexto, 
        // Parámetros de findOneByKeyService (model, data, header, options...)
        model, 
        data, 
        header
    );
   console.log('✅ resData **', resData);
   let objRes: I_InfResponse;
   if (resData !== null) {
// Logica para usuario existente 
   
   header.cveIdioma = resData.CVE_IDIOMA;
   header.cvePerfil = resData.CVE_PERFIL;

   const idQuery = kInfUsuario;
   const parmRemp = {$1 : cveUsuario}   
   const resUsuario : I_InfResponse = await ejecFuncion
   (ExecRawQueryById, header, contexto, idQuery, parmRemp);
   console.log('✅ Inf Usuario ', resUsuario);

   let idQuiniela : number;
   let idParticipante : number;
   let idPeriodo : number;
   let bResSurv : boolean;
   let fLimite : FileSystemWriteChunkType;
   let horaLimite : string;
   let titQuiniela : string;
   let bSurvivor : boolean;

   if (resUsuario && resUsuario.data && Array.isArray(resUsuario.data) && resUsuario.data.length > 0) {
   const getMeData = resUsuario.data[0];
   const parsedInfUsuario = JSON.parse(getMeData.infUsuario);
   const parsedInfPeriodo = JSON.parse(getMeData.infPeriodo); 
   const parsedInfQuiniela = JSON.parse(getMeData.InfQuiniela);
   const parsedInfSurvivor = JSON.parse(getMeData.infSurvivor);

   idQuiniela = parsedInfUsuario.ID_QUINIELA;
   idParticipante = parsedInfUsuario.ID_PARTICIPANTE;
   idPeriodo = parsedInfPeriodo.ID_PERIODO;
   bResSurv = parsedInfPeriodo.B_RES_SURV;
   fLimite = parsedInfPeriodo.F_LIMITE;
   horaLimite = parsedInfPeriodo.HORA_LIMITE;
   titQuiniela = parsedInfQuiniela.TIT_QUINIELA;
   bSurvivor = parsedInfSurvivor.B_SURVIVOR;

    const resResp  =
    [{cveUsuario : cveUsuario, cveIdioma : resData.CVE_IDIOMA, cvePerfil : resData.CVE_PERFIL,
     nombre : resData.NOMBRE + ' ' + resData.APELLIDO_PATERNO + ' ' + resData.APELLIDO_MATERNO,
     idQuiniela : idQuiniela, idParticipante : idParticipante, idPeriodo : idPeriodo,
     bResSurv : bResSurv, fLimite : fLimite, horaLimite: horaLimite, titQuiniela : titQuiniela,
     bSurvivor : bSurvivor
    }];
    objRes = {estatus: kCorrecto, data : resResp, errorUs: null, errorNeg : null};
    return objRes;
   } else {
    throw ('Datos de Usuario Inexistentes');    
   }
 }
    
}

*/

export async function getMe(idProceso: number, cveAplicacion: string, cveUsuario: string): Promise<I_InfResponse> {
    console.log('✅ Iniciando getMe para:', cveUsuario);
    
    const sequelize: Sequelize = await getInstancia();
    const header: I_Header = creaHeadEsq(cveAplicacion);
    header.idProceso = idProceso;
    header.cveAplicacion = cveAplicacion;
    header.cveUsuario = cveUsuario;

    const data = { CVE_USUARIO: cveUsuario };
    const nomModelo = 'FC_SEG_USUARIO';
    const contexto = 'Proceso getMe / Login';
    const model: any = sequelize.models[nomModelo];

    type FindUserFunction = (...args: any[]) => Promise<I_FC_SEG_USUARIO | null>;

    // 1. Buscamos los datos básicos del usuario
    const resData: I_FC_SEG_USUARIO | null = await ejecFuncion<FindUserFunction>(
        findOneByKeyService,
        header,
        contexto,
        model,
        data,
        header
    );

    if (!resData) {
        throw new Error('Datos de Usuario Inexistentes en FC_SEG_USUARIO');
    }

    // 2. Actualizamos el header con lo obtenido
    header.cveIdioma = resData.CVE_IDIOMA;
    header.cvePerfil = resData.CVE_PERFIL;

    // 3. Consultamos la información extendida (Quiniela, Periodo, etc.)
    const idQuery = kInfUsuario;
    const parmRemp = { $1: cveUsuario };
    const resUsuario: I_InfResponse = await ejecFuncion(
        ExecRawQueryById, 
        header, 
        contexto, 
        idQuery, 
        parmRemp
    );

    if (resUsuario && resUsuario.data && Array.isArray(resUsuario.data) && resUsuario.data.length > 0) {
        const getMeData = resUsuario.data[0];

        // Parseo de los JSON que vienen de SQL Server
        const parsedInfUsuario = JSON.parse(getMeData.infUsuario);
        const parsedInfPeriodo = JSON.parse(getMeData.infPeriodo);
        const parsedInfQuiniela = JSON.parse(getMeData.InfQuiniela);
        const parsedInfSurvivor = JSON.parse(getMeData.infSurvivor);

        // 4. Armamos el objeto de respuesta final para el cliente
        const respuestaCliente  = {
            cveUsuario: cveUsuario,
            cveIdioma: resData.CVE_IDIOMA,
            cvePerfil: resData.CVE_PERFIL,
            nombreCompleto: `${resData.NOMBRE} ${resData.APELLIDO_PATERNO} ${resData.APELLIDO_MATERNO || ''}`.trim(),
            // Datos de la Quiniela
            idQuiniela: parsedInfUsuario.ID_QUINIELA,
            idParticipante: parsedInfUsuario.ID_PARTICIPANTE,
            idPeriodo: parsedInfPeriodo.ID_PERIODO,
            bResSurv: parsedInfPeriodo.B_RES_SURV,
            fLimite: parsedInfPeriodo.F_LIMITE,
            horaLimite: parsedInfPeriodo.HORA_LIMITE,
            titQuiniela: parsedInfQuiniela.TIT_QUINIELA,
            bSurvivor: parsedInfSurvivor.B_SURVIVOR
        };

        console.log('✅ getMe finalizado con éxito para:', cveUsuario);

        return {
            estatus: kCorrecto,
            data: [respuestaCliente],
            errorUs: null,
            errorNeg: null
        };

    } else {
        throw new Error('No se encontró información extendida (Quiniela) para el usuario');
    }
}

