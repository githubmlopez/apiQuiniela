  import { Request, Response } from 'express';
  import {getInstancia}  from '@config/index.js';
  import { I_Header, I_InfReqCrud} from '@modelos/index.js';
  import { CustomJwtPayload } from '@modelos/index.js';
  import {createRecordService, updateRecordService, deleteRecordService,
  bulkCreateRecordService, bulkUpdateRecordService,  findOneByKeyService}
  from '@router/index.js'

  const kCorrecto     = 1;
  const kErrorSistema = 2;
  const kErrorNegocio = 3;

  export interface I_ObjCrud {
  infToken : CustomJwtPayload, 
  model : any, 
  data : Record<string, any> | null,
  header :I_Header
  }
  
  const sequelize = await getInstancia();

  export async function ctrCrudCreate(req : Request, res : Response) {
  console.log( '✅ Crud Create', req.datosUsuario);
  const { model, data} = creaObjCrud(req.datosUsuario, req.body);

  try {
    const resData = await createRecordService(model, data);
    res.status(200).json (resData);
    console.log( '✅ Regreso de ejecutar procedimiento'); 
    } catch (error) {
    res.status(422).json
    ({estatus: kErrorSistema, data :null, errorUs: error, errorNeg : null});
    }
 }

 export async function ctrCrudUpdate(req : Request, res : Response) {
  console.log( '✅ Crud Update', req.datosUsuario);
  const { model, data } = creaObjCrud(req.datosUsuario, req.body);

  try {
    const resData = await updateRecordService(model, data);
      res.status(200).json (resData);
    console.log( '✅ Regreso de ejecutar Uddate'); 
    } catch (error) {
    res.status(422).json
    ({estatus: kErrorSistema, data :null, errorUs: error, errorNeg : null});
    }
 }

 export async function ctrCrudDelete(req : Request, res : Response) {
  console.log( '✅ Crud Delete', req.datosUsuario);
  const { model, data } = creaObjCrud(req.datosUsuario, req.body);

  try {
    const resData = await deleteRecordService(model, data);
    res.status(200).json (resData);
    console.log( '✅ Regreso de ejecutar Delete'); 
    } catch (error) {
    res.status(422).json
    ({estatus: kErrorSistema, data :null, errorUs: error, errorNeg : null});
    }
 }

export async function ctrCrudBulkC(req : Request, res : Response) {
  console.log( '✅ Bulk Insert', req.datosUsuario);
  const { model, data } = creaObjCrud(req.datosUsuario, req.body);

  try {

    const resData = await bulkCreateRecordService(model, data);
    res.status(200).json (resData);
    console.log( '✅ Regreso de ejecutar Bulk Insert'); 
    } catch (error) {
    res.status(422).json
    ({estatus: kErrorSistema, data :null, errorUs: error, errorNeg : null});
    }
 }

 export async function ctrCrudBulkU(req : Request, res : Response) {
  console.log( '✅ Bulk Update', req.datosUsuario);
  const { model, data } = creaObjCrud(req.datosUsuario, req.body);

  try {

    const resData = await bulkUpdateRecordService(model, data);
    res.status(200).json (resData);
    console.log( '✅ Regreso de ejecutar Modify'); 
    } catch (error) {
    res.status(422).json
    ({estatus: kErrorSistema, data :null, errorUs: error, errorNeg : null});
    }
 }

 export async function ctrFindByKey(req : Request, res : Response) {
  const { model, data } = creaObjCrud(req.datosUsuario, req.body);
  const contexto = 'Ejecucion Find By Key';
  try {

    if (!data || Array.isArray(data)) {
        throw ('Datos de búsqueda inválidos o ausentes.');
    }
    const resData = await findOneByKeyService(model, data);

    if(resData) {
    const safeData = { 
        ...resData, 
        PASSWORD: '**********' 
    };
    res.status(200).json 
    ({estatus: kCorrecto, data :[safeData], errorUs: null, errorNeg : null});
    } else {
    res.status(200).json 
    ({estatus: kErrorNegocio, data :null, errorUs: null, errorNeg : ['No existe la información Solicitada']}); 
    }
    } catch (error) {
    res.status(422).json
    ({estatus: kErrorSistema, data :null, errorUs: error, errorNeg : null});
    }
 }
 
export function creaObjCrud(infToken: CustomJwtPayload, infReq: I_InfReqCrud): { model: any, data: any} {
    
    const modelo = infReq.model;
    const data: Record<string, any> | Record<string, any>[] | null = infReq.data;
    
    // Assuming 'sequelize' is available globally or imported here
    const model = sequelize.models[modelo]; 
    
//    const header: I_Header = armaHeaderQuery(infToken, infReq.idProceso);
    
    return { model, data};
}

