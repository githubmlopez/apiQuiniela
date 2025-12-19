import { QueryByIdService } from '../Servicios/QueryProc/QueryByIdService.js';
const kErrorSistema = 2;
export async function ctrlExecQuery(req, res) {
    console.log('✅ ExecQuery', req.datosUsuario);
    const infReq = req.body;
    const contexto = 'Ejecucion de Query';
    const parmRemp = infReq.parmRemp;
    const campos = infReq.campos ?? [];
    const where = infReq.where ?? [];
    const idQuery = infReq.idQuery;
    const orderBy = infReq.orderBy ?? [];
    const numReg = infReq.numReg ?? 20;
    const skip = infReq.skip ?? 20;
    if (idQuery) {
        try {
            const resData = await QueryByIdService(idQuery, parmRemp, campos, where, orderBy, numReg, skip);
            return void res.status(200).json(resData);
        }
        catch {
            return void res.status(422).json({ estatus: kErrorSistema, data: null, errorUs: 'Error ' + contexto, errorNeg: null });
        }
    }
    else {
        return void res.status(400).json({ estatus: kErrorSistema, data: null, errorUs: 'Error ' + contexto, errorNeg: null });
    }
}
