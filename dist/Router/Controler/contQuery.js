import { ExecRawQueryById } from '../index.js';
import { ejecFuncion, armaHeaderQuery } from '../../index.js';
const kErrorSistema = 2;
export async function ctrlExecQuery(req, res) {
    console.log('✅ ExecQuery', req.datosUsuario);
    const infToken = req.datosUsuario;
    const infReq = req.body;
    const header = armaHeaderQuery(infToken, infReq.idProceso);
    const contexto = 'Ejecucion de Query';
    const parmRemp = infReq.parmRemp;
    const campos = infReq.campos;
    const where = infReq.where;
    const idQuery = infReq.idQuery;
    const modelo = infReq.modelo;
    const orderBy = infReq.orderBy;
    const numReg = infReq.numReg;
    const skip = infReq.skip;
    if (idQuery) {
        try {
            const resData = await ejecFuncion(ExecRawQueryById, header, contexto, idQuery, parmRemp, campos, where, orderBy, numReg, skip);
            res.status(200).json(resData);
        }
        catch {
            res.status(422).json({ estatus: kErrorSistema, data: null, errorUs: 'Error ' + contexto, errorNeg: null });
        }
    }
    else {
        res.status(400).json({ estatus: kErrorSistema, data: null, errorUs: 'Error ' + contexto, errorNeg: null });
    }
}
