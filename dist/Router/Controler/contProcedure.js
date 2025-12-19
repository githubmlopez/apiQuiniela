import { execProcedureService } from '../Servicios/QueryProc/execProcedureService.js';
const kErrorSistema = 2;
export async function ctrlExecProcedure(req, res) {
    console.log('✅ Procedure', req.datosUsuario);
    const infReq = req.body;
    const contexto = 'Ejecucion de Procedimiento';
    const parmRemp = infReq.parmRemp;
    const idProcedure = infReq.idProcedure;
    console.log('✅ Parametros', parmRemp);
    if (idProcedure) {
        try {
            const resData = await execProcedureService(idProcedure, parmRemp);
            return void res.status(200).json(resData);
            console.log('✅ Regreso de ejecutar procedimiento');
        }
        catch {
            return void res.status(422).json({ estatus: kErrorSistema, data: null, errorUs: 'Error ' + contexto, errorNeg: null });
        }
    }
    else {
        return void res.status(422).json({ estatus: kErrorSistema, data: null, errorUs: 'Error ' + contexto, errorNeg: null });
    }
}
