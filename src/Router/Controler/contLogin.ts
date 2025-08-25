import { Request, Response } from 'express';
import {login, creaUsuario}  from '../index.js';
import { I_Autentica, I_Header, I_InfUsuario, I_InfResponse, I_FC_SEG_USUARIO} from '../../index.js';
import { ejecFuncion, creaHeadEsq} from '../../index.js';

const kErrorSistema = 2;

export async function ctrlLogin(req : Request, res : Response) {
 
  const requestBody : I_Autentica = req.body;
  const idProceso = requestBody.idProceso;
  const cveAplicacion = requestBody.cveAplicacion;
  const cveUsuario = requestBody.cveUsuario;
  const password = requestBody.password;
  const header : I_Header = creaHeadEsq();
  header.idProceso = idProceso;
  header.cveUsuario = cveUsuario;
  header.cveAplicacion = cveAplicacion;
  header.cveIdioma  = ' ';
  header.cvePerfil  = ' ';
  const contexto = 'Proceso de Login';

  try {
  const result : I_InfResponse = await ejecFuncion(login, header, contexto, idProceso, cveAplicacion, cveUsuario, password)
  if (!result.errorUs) {
    res.status(200).json (result);
   } else {
    console.log('❌ Error en usuario o Password');
    res.status(422).json
    ({estatus: kErrorSistema, data :null, errorUs: 'Error en usuario o Password', errorNeg : null});
  }
  } catch (error) { 
    console.log('❌ Error en usuario o Password');
    res.status(422).json
    ({estatus: kErrorSistema, data :null, errorUs: 'Error en usuario o Password', errorNeg : null});
  }
}

export async function ctrlUsuario(req : Request, res : Response) {
 
  const requestBody : I_InfUsuario = req.body;
  const header : I_Header = creaHeadEsq();
  header.idProceso = requestBody.idProceso;
//  const header : I_Header = requestBody.header;
  const data : I_FC_SEG_USUARIO | null = requestBody.data;
  const contexto = 'Error en Creacion de Usuario';

  try {
  const result = await ejecFuncion(creaUsuario, header, contexto, header, data);
  res.status(200).json(result);
  console.log('✅ Respuesta correcta Crea Usuario');
  } catch (error) {
    res.status(422).json
    ({estatus: kErrorSistema, data :null, errorUs: error, errorNeg : null});;
  }
}