import { ExecProcedure } from '../index.js';
import { ejecFuncion, armaHeaderQuery } from '../../index.js';
const kErrorSistema = 2;
export async function ctrlExecProcedure(req, res) {
    console.log('✅ Procedure', req.datosUsuario);
    const infToken = req.datosUsuario;
    const infReq = req.body;
    const header = armaHeaderQuery(infToken, infReq.idProceso);
    console.log('✅ Header', header);
    const contexto = 'Ejecucion de Procedimiento';
    const parmRemp = infReq.parmRemp;
    const idProcedure = infReq.idProcedure;
    console.log('✅ Parametros', parmRemp);
    if (idProcedure) {
        try {
            const resData = await ejecFuncion(ExecProcedure, header, contexto, idProcedure, parmRemp, header);
            res.status(200).json(resData);
            console.log('✅ Regreso de ejecutar procedimiento');
        }
        catch {
            res.status(422).json({ estatus: kErrorSistema, data: null, errorUs: 'Error ' + contexto, errorNeg: null });
        }
    }
    else {
        res.status(422).json({ estatus: kErrorSistema, data: null, errorUs: 'Error ' + contexto, errorNeg: null });
    }
}
