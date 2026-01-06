import { envConfig } from '../../index.js';
import { getInstancia } from '../../index.js';
import { Sequelize} from 'sequelize';
import { verify } from 'argon2';
import jwt from 'jsonwebtoken';
import { findOneByKeyService} from '../Servicios/index.js';
import { ejecFuncion, creaHeadEsq, ExecRawQueryById} from '../../index.js'
import { I_Header, I_InfResponse, I_FC_SEG_USUARIO} from '../../index.js';

const kCorrecto = 1;
const kErrorAut = 4;
const kInfUsuario = '5';
const kActivo = 'A'; 

export async function login(idProceso: number, cveAplicacion : string, cveUsuario : string, password : string) : Promise<any> {
   console.log('✅ Login', idProceso, cveUsuario, password);
   const sequelize : Sequelize = await getInstancia();
   const _sign = jwt.sign;
   const header : I_Header = creaHeadEsq(cveAplicacion);
   header.idProceso = idProceso;
   header.cveAplicacion = cveAplicacion;
   header.cveUsuario = cveUsuario;
   const data = 
   {
      CVE_USUARIO      : cveUsuario
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
   const loginData = resUsuario.data[0];
   const parsedInfUsuario = JSON.parse(loginData.infUsuario);
   const parsedInfPeriodo = JSON.parse(loginData.infPeriodo); 
   const parsedInfQuiniela = JSON.parse(loginData.InfQuiniela);
   const parsedInfSurvivor = JSON.parse(loginData.infSurvivor);
   idQuiniela = parsedInfUsuario.ID_QUINIELA;
   idParticipante = parsedInfUsuario.ID_PARTICIPANTE;
   idPeriodo = parsedInfPeriodo.ID_PERIODO;
   bResSurv = parsedInfPeriodo.B_RES_SURV;
   fLimite = parsedInfPeriodo.F_LIMITE;
   horaLimite = parsedInfPeriodo.HORA_LIMITE;
   titQuiniela = parsedInfQuiniela.TIT_QUINIELA;
   bSurvivor = parsedInfSurvivor.B_SURVIVOR;

   } else {
   throw ('Datos de Usuario Inexistentes');    
   }

   let token;
   if (resData && resData.PASSWORD) {
      console.log('✅ Hash ', resData.PASSWORD, password);
      const verHash : boolean = await verify(resData.PASSWORD, password);
      if (verHash && resData.SIT_USUARIO ===  kActivo) { 
        console.log('✅ Resultado', resData);
        token = _sign(
        { cveAplicacion : cveAplicacion, cveUsuario : resData.CVE_USUARIO, cveIdioma : resData.CVE_IDIOMA,
          cvePerfil : resData.CVE_PERFIL},
        envConfig.PASS_SEC,
        {expiresIn: '12h'});
   
        if (token) {
           const resResp  =
           [{token : token, cveUsuario : cveUsuario, cveIdioma : resData.CVE_IDIOMA, cvePerfil : resData.CVE_PERFIL,
             nombre : resData.NOMBRE + ' ' + resData.APELLIDO_PATERNO + ' ' + resData.APELLIDO_MATERNO,
             idQuiniela : idQuiniela, idParticipante : idParticipante, idPeriodo : idPeriodo,
             bResSurv : bResSurv, fLimite : fLimite, horaLimite: horaLimite, titQuiniela : titQuiniela,
             bSurvivor : bSurvivor
             }];
                         console.log('✅ resResp * ', resResp);
           objRes = {estatus: kCorrecto, data : resResp, errorUs: null, errorNeg : null};

        } else {
           objRes = {estatus: kErrorAut, data : null, errorUs: 'Error en usuario o Password', errorNeg : null};
        }
      } else {
      console.log('❌ Error usuario password');
      objRes = {estatus: kErrorAut, data : null, errorUs: 'Error en usuario o Password', errorNeg : null};
      }
   } else {
     objRes = {estatus: kErrorAut, data : null, errorUs: 'Error en usuario o Password', errorNeg : null};      
   }
   } else {
     objRes = {estatus: kErrorAut, data : null, errorUs: 'Error en usuario o Password', errorNeg : null}; 
   } 
   return objRes;
}







