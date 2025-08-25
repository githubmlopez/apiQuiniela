  import { Request, Response } from 'express';
  import
  {createRecord, updateRecord, DeleteRecord, bulkCreateRecords,
   bulkUpdateRecords, findOneByPrimaryKey }
    from '../index.js';
  import {getInstancia}  from '../../index.js';
  import { I_Header, I_InfReqCrud} from '../../index.js';
  import { CustomJwtPayload } from '../../index.js';
  import { ejecFuncion, armaHeaderQuery} from '../../index.js';

  const kErrorSistema = 2;

  export interface I_ObjCrud {
  infToken : CustomJwtPayload, 
  model : any, 
  data : Record<string, any> | null,
  header :I_Header
  }
  
  const sequelize = await getInstancia();

  export async function ctrCrudCreate(req : Request, res : Response) {
  console.log( '✅ Crud Create', req.datosUsuario);
  const objCrud : I_ObjCrud = creaObjCrud(req)
  const contexto = 'Ejecucion Crud/Create';
  try {
    const resData = await ejecFuncion
   (createRecord, objCrud.header, contexto, objCrud.model, objCrud.data);
      res.status(200).json (resData);
    console.log( '✅ Regreso de ejecutar procedimiento'); 
    } catch (error) {
    res.status(422).json
    ({estatus: kErrorSistema, data :null, errorUs: error, errorNeg : null});
    }
 }


 export async function ctrCrudUpdate(req : Request, res : Response) {
  console.log( '✅ Crud Update', req.datosUsuario);
  const objCrud : I_ObjCrud = creaObjCrud(req)
  console.log( '✅ objCrud', objCrud);
  const contexto = 'Ejecucion Crud/Update';
  try {
    const resData = await ejecFuncion
   (updateRecord, objCrud.header, contexto, objCrud.model, objCrud.data);
      res.status(200).json (resData);
    console.log( '✅ Regreso de ejecutar Uddate'); 
    } catch (error) {
    res.status(422).json
    ({estatus: kErrorSistema, data :null, errorUs: error, errorNeg : null});
    }
 }

 export async function ctrCrudDelete(req : Request, res : Response) {
  console.log( '✅ Crud Delete', req.datosUsuario);
  const objCrud : I_ObjCrud= creaObjCrud(req)
  const contexto = 'Ejecucion Crud/Delete';
  try {
    const resData = await ejecFuncion
   (DeleteRecord, objCrud.header, contexto, objCrud.model, objCrud.data);
      res.status(200).json (resData);
    console.log( '✅ Regreso de ejecutar Delete'); 
    } catch (error) {
    res.status(422).json
    ({estatus: kErrorSistema, data :null, errorUs: error, errorNeg : null});
    }
 }

export async function ctrCrudBulkC(req : Request, res : Response) {
  console.log( '✅ Bulk Insert', req.datosUsuario);
  const objCrud : I_ObjCrud = creaObjCrud(req)
  const contexto = 'Ejecucion Crud/Bulk Insert';
  try {
    const resData = await ejecFuncion
   (bulkCreateRecords, objCrud.header, contexto, objCrud.model, objCrud.data);
      res.status(200).json (resData);
    console.log( '✅ Regreso de ejecutar Bulk Insert'); 
    } catch (error) {
    res.status(422).json
    ({estatus: kErrorSistema, data :null, errorUs: error, errorNeg : null});
    }
 }

 export async function ctrCrudBulkU(req : Request, res : Response) {
  console.log( '✅ Bulk Update', req.datosUsuario);
  const objCrud : I_ObjCrud = creaObjCrud(req)
  console.log( '✅ objCrud', objCrud);
  const contexto = 'Ejecucion Crud/Bulk Update';
  try {
    const resData = await ejecFuncion
   (bulkUpdateRecords , objCrud.header, contexto, objCrud.model, objCrud.data);
      res.status(200).json (resData);
    console.log( '✅ Regreso de ejecutar Modify'); 
    } catch (error) {
    res.status(422).json
    ({estatus: kErrorSistema, data :null, errorUs: error, errorNeg : null});
    }
 }

 export async function ctrFindByKey(req : Request, res : Response) {
  console.log( '✅ Crud Find By Key', req.datosUsuario);
  const objCrud : I_ObjCrud = creaObjCrud(req)
  const contexto = 'Ejecucion Find By Key';
  try {
    if (!objCrud.data || Array.isArray(objCrud.data)) {
        throw ('Datos de búsqueda inválidos o ausentes.');
    }
    const resData = await ejecFuncion
   (findOneByPrimaryKey, objCrud.header, contexto, objCrud.model, objCrud.data);
      res.status(200).json (resData);
    console.log( '✅ Regreso de ejecutar Uddate'); 
    } catch (error) {
    res.status(422).json
    ({estatus: kErrorSistema, data :null, errorUs: error, errorNeg : null});
    }
 }

 function creaObjCrud(req : Request) : I_ObjCrud {
  console.log( '✅ Creando ObjCrud ', req.datosUsuario, req.body);
  const infToken : CustomJwtPayload= req.datosUsuario;
  const infReq : I_InfReqCrud = req.body;
  const modelo = infReq.model;
  console.log( '✅ ModeloName ', modelo);
  const data : Record<string, any> | Record<string, any>[] | null = infReq.data;
  const model = sequelize.models[modelo] 
    console.log( '✅ Model ', model);
  const header :I_Header = armaHeaderQuery(infToken, infReq.idProceso);
  return {infToken, model, data, header}
 }

