import { Request, Response } from 'express';
import {ExecProcedure}  from '../index.js';
import { I_Header, I_InfReqProc, KeyValueObject} from '../../index.js';
import { CustomJwtPayload } from '../../index.js';
import { ejecFuncion, armaHeaderQuery} from '../../index.js'

const kErrorSistema = 2;

export async function ctrlExecProcedure(req : Request, res : Response) {
  console.log( '✅ Procedure', req.datosUsuario);
  const infToken : CustomJwtPayload= req.datosUsuario;
  const infReq : I_InfReqProc = req.body;
  const header :I_Header = armaHeaderQuery(infToken, infReq.idProceso);
    console.log( '✅ Header', header);
  const contexto = 'Ejecucion de Procedimiento';
  const parmRemp : KeyValueObject = infReq.parmRemp;
  const idProcedure = infReq.idProcedure;
  console.log( '✅ Parametros', parmRemp);


  if (idProcedure) {
     try {
    const resData = await ejecFuncion
   (ExecProcedure, header, contexto, idProcedure, parmRemp, header);
    res.status(200).json (resData);
   console.log( '✅ Regreso de ejecutar procedimiento'); 
    } catch {
    res.status(422).json
    ({estatus: kErrorSistema, data :null, errorUs: 'Error ' + contexto, errorNeg : null});
    }
  } else {
    res.status(400).json({estatus: kErrorSistema, data :null, errorUs: 'Error ' + contexto, errorNeg : null});     
  }
}

