import { getInstancia } from '../../index.js';
import { createRecordService, updateRecordService, deleteRecordService, bulkCreateRecordService, bulkUpdateRecordService, findOneByKeyService } from '../Servicios/CRUD/index.js';
const kErrorSistema = 2;
const sequelize = await getInstancia();
export async function ctrCrudCreate(req, res) {
    console.log('✅ Crud Create', req.datosUsuario);
    const { model, data } = creaObjCrud(req.datosUsuario, req.body);
    try {
        const resData = await createRecordService(model, data);
        res.status(200).json(resData);
        console.log('✅ Regreso de ejecutar procedimiento');
    }
    catch (error) {
        res.status(422).json({ estatus: kErrorSistema, data: null, errorUs: error, errorNeg: null });
    }
}
export async function ctrCrudUpdate(req, res) {
    console.log('✅ Crud Update', req.datosUsuario);
    const { model, data } = creaObjCrud(req.datosUsuario, req.body);
    try {
        const resData = await updateRecordService(model, data);
        res.status(200).json(resData);
        console.log('✅ Regreso de ejecutar Uddate');
    }
    catch (error) {
        res.status(422).json({ estatus: kErrorSistema, data: null, errorUs: error, errorNeg: null });
    }
}
export async function ctrCrudDelete(req, res) {
    console.log('✅ Crud Delete', req.datosUsuario);
    const { model, data } = creaObjCrud(req.datosUsuario, req.body);
    try {
        const kCaller = 'R';
        const resData = await deleteRecordService(model, data);
        res.status(200).json(resData);
        console.log('✅ Regreso de ejecutar Delete');
    }
    catch (error) {
        res.status(422).json({ estatus: kErrorSistema, data: null, errorUs: error, errorNeg: null });
    }
}
export async function ctrCrudBulkC(req, res) {
    console.log('✅ Bulk Insert', req.datosUsuario);
    const { model, data } = creaObjCrud(req.datosUsuario, req.body);
    try {
        const resData = await bulkCreateRecordService(model, data);
        res.status(200).json(resData);
        console.log('✅ Regreso de ejecutar Bulk Insert');
    }
    catch (error) {
        res.status(422).json({ estatus: kErrorSistema, data: null, errorUs: error, errorNeg: null });
    }
}
export async function ctrCrudBulkU(req, res) {
    console.log('✅ Bulk Update', req.datosUsuario);
    const { model, data } = creaObjCrud(req.datosUsuario, req.body);
    try {
        const resData = await bulkUpdateRecordService(model, data);
        res.status(200).json(resData);
        console.log('✅ Regreso de ejecutar Modify');
    }
    catch (error) {
        res.status(422).json({ estatus: kErrorSistema, data: null, errorUs: error, errorNeg: null });
    }
}
export async function ctrFindByKey(req, res) {
    console.log('✅ Crud Find By Key', req.datosUsuario);
    const { model, data } = creaObjCrud(req.datosUsuario, req.body);
    const contexto = 'Ejecucion Find By Key';
    try {
        if (!data || Array.isArray(data)) {
            throw ('Datos de búsqueda inválidos o ausentes.');
        }
        const resData = await findOneByKeyService(model, data);
        res.status(200).json(resData);
        console.log('✅ Regreso de ejecutar Uddate');
    }
    catch (error) {
        res.status(422).json({ estatus: kErrorSistema, data: null, errorUs: error, errorNeg: null });
    }
}
export function creaObjCrud(infToken, infReq) {
    console.log('✅ Creando ObjCrud ', infToken, infReq);
    const modelo = infReq.model;
    const data = infReq.data;
    // Assuming 'sequelize' is available globally or imported here
    const model = sequelize.models[modelo];
    //    const header: I_Header = armaHeaderQuery(infToken, infReq.idProceso);
    return { model, data };
}
