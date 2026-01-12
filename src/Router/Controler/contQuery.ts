import { Request, Response } from 'express';
import { I_InfReqQuery, KeyValueObject} from '../../index.js';
import { QueryByIdService } from '../Servicios/QueryProc/QueryByIdService.js';
import { I_Header, I_InfResponse} from '../../index.js';
import { ejecFuncion, creaHeadEsq} from '../../index.js';
import {getMe}  from '../index.js';

const kErrorSistema = 2;

export async function ctrlExecQuery(req : Request, res : Response): Promise<void> {
  console.log( '✅ ExecQuery', req.datosUsuario);
  const infReq : I_InfReqQuery = req.body;
  const contexto = 'Ejecucion de Query'
  const parmRemp : KeyValueObject = infReq.parmRemp;
  const campos   = infReq.campos ?? [];
  const where = infReq.where ?? [];
  const idQuery = infReq.idQuery;
  const orderBy = infReq.orderBy ?? [];
  const numReg = infReq.numReg ?? 20;
  const skip = infReq.skip ?? 20;
  
  if (idQuery) {  
    try {
    const resData = await QueryByIdService ( idQuery, parmRemp, campos, where, orderBy, numReg, skip);
      return void res.status(200).json (resData);
    } catch {
    return void res.status(422).json
    ({estatus: kErrorSistema, data :null, errorUs: 'Error ' + contexto, errorNeg : null});
    }
  } else {
    return void res.status(400).json({estatus: kErrorSistema, data :null, errorUs: 'Error ' + contexto, errorNeg : null});     
  }
}

export async function ctrlGetMe(req : Request, res : Response) {
  const requestBody  = req.body;
  const idProceso = requestBody.idProceso;
  const cveAplicacion = req.datosUsuario.cveAplicacion;
  const cveUsuario = req.datosUsuario.cveUsuario;
  const header : I_Header = creaHeadEsq(cveAplicacion);
  header.idProceso = idProceso;
  header.cveUsuario = cveUsuario;
  header.cveAplicacion = cveAplicacion;
  header.cveIdioma  = ' ';
  header.cvePerfil  = ' ';
  const contexto = 'Proceso de Get me';

  try {
  const result : I_InfResponse = await ejecFuncion(getMe, header, contexto, idProceso, cveAplicacion, cveUsuario)
  if (!result.errorUs && result.data && result.data.length > 0) {
    res.status(200).json (result);
   } else {
    console.log('❌ Error en proceso getMe');
    res.status(422).json
    ({estatus: kErrorSistema, data :null, errorUs: 'No se obtuvieron Datos', errorNeg : null});
  }
  } catch (error) { 
    console.log('❌ Error en proceso getMe');
    res.status(422).json
    ({estatus: kErrorSistema, data :null, errorUs: 'Error proceso getMe', errorNeg : null});
  }
}

