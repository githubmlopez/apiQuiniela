import { Request, Response } from 'express';
import { I_InfReqProc, KeyValueObject} from '@modelos/index.js';
import { execProcedureService } from '@router/index.js';

const kErrorSistema = 2;

export async function ctrlExecProcedure(req : Request, res : Response) : Promise<void> {
  const infReq : I_InfReqProc = req.body;
  const contexto = 'Ejecucion de Procedimiento';
  const parmRemp : KeyValueObject = infReq.parmRemp ?? null;
  const idProcedure = infReq.idProcedure;
  console.log( '✅ Parametros', parmRemp);

  if (idProcedure) {
    try {
    const resData = await execProcedureService (idProcedure, parmRemp);
    return void res.status(200).json (resData);
    console.log( '✅ Regreso de ejecutar procedimiento'); 
    } catch {
    return void res.status(422).json
    ({estatus: kErrorSistema, data :null, errorUs: 'Error ' + contexto, errorNeg : null});
    }
  } else {
    return void res.status(422).json({estatus: kErrorSistema, data :null, errorUs: 'Error ' + contexto, errorNeg : null});     
  }
}

