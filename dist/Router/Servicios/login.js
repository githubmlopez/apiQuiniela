import { envConfig } from '../../index.js';
import { getInstancia } from '../../index.js';
import { hash, verify } from 'argon2';
import jwt from 'jsonwebtoken';
import { createRecord, findOneByPrimaryKey } from '../../index.js';
import { ejecFuncion, creaHeadEsq, ExecRawQueryById } from '../../index.js';
const kCorrecto = 1;
const kErrorAut = 4;
const kInfUsuario = '5';
const kActivo = 'A';
export async function login(idProceso, cveAplicacion, cveUsuario, password) {
    console.log('✅ Login', idProceso, cveUsuario, password);
    const sequelize = await getInstancia();
    const _sign = jwt.sign;
    const header = creaHeadEsq();
    header.idProceso = idProceso;
    header.cveAplicacion = cveAplicacion;
    header.cveUsuario = cveUsuario;
    const data = creaUsuarioDummy(cveUsuario);
    const nomModelo = 'FC_SEG_USUARIO';
    const contexto = 'Proceso login';
    const model = sequelize.models[nomModelo];
    const resData = await ejecFuncion(buscaByKey, header, contexto, model, data);
    let objRes;
    if (resData !== null) {
        // Logica para usuario existente 
        header.cveIdioma = resData.CVE_IDIOMA;
        header.cvePerfil = resData.CVE_PERFIL;
        const idQuery = kInfUsuario;
        const parmRemp = { $1: cveUsuario };
        const resUsuario = await ejecFuncion(ExecRawQueryById, header, contexto, idQuery, parmRemp);
        console.log('✅ Inf Usuario ', resUsuario);
        let idQuiniela;
        let idParticipante;
        let idPeriodo;
        let bResSurv;
        let fLimite;
        let horaLimite;
        let titQuiniela;
        let bSurvivor;
        if (resUsuario && resUsuario.data && Array.isArray(resUsuario.data) && resUsuario.data.length > 0) {
            const loginData = resUsuario.data[0];
            const parsedInfUsuario = JSON.parse(loginData.infUsuario);
            const parsedInfPeriodo = JSON.parse(loginData.infPeriodo);
            const parsedInfQuiniela = JSON.parse(loginData.InfQuiniela);
            const parsedInfSurvivor = JSON.parse(loginData.infSurvivor);
            idQuiniela = parsedInfUsuario.ID_QUINIELA;
            idParticipante = parsedInfUsuario.ID_PARTICIPANTE;
            idPeriodo = parsedInfPeriodo.ID_PERIODO;
            bResSurv = parsedInfPeriodo.B_RES_SURV;
            fLimite = parsedInfPeriodo.F_LIMITE;
            horaLimite = parsedInfPeriodo.HORA_LIMITE;
            titQuiniela = parsedInfQuiniela.TIT_QUINIELA;
            bSurvivor = parsedInfSurvivor.B_SURVIVOR;
        }
        else {
            throw ('Datos de Usuario Inexistentes');
        }
        let token;
        if (resData && resData.PASSWORD) {
            console.log('✅ Hash ', resData.PASSWORD, password);
            const verHash = await verify(resData.PASSWORD, password);
            if (verHash && resData.SIT_USUARIO === kActivo) {
                console.log('✅ Resultado', resData);
                token = _sign({ cveAplicacion: cveAplicacion, cveUsuario: resData.CVE_USUARIO, cveIdioma: resData.CVE_IDIOMA,
                    cvePerfil: resData.CVE_PERFIL }, envConfig.PASS_SEC, { expiresIn: '12h' });
                if (token) {
                    const resResp = [{ token: token, cveUsuario: cveUsuario, cveIdioma: resData.CVE_IDIOMA, cvePerfil: resData.CVE_PERFIL,
                            nombre: resData.NOMBRE + ' ' + resData.APELLIDO_PATERNO + ' ' + resData.APELLIDO_MATERNO,
                            idQuiniela: idQuiniela, idParticipante: idParticipante, idPeriodo: idPeriodo,
                            bResSurv: bResSurv, fLimite: fLimite, horaLimite: horaLimite, titQuiniela: titQuiniela,
                            bSurvivor: bSurvivor
                        }];
                    console.log('✅ resResp * ', resResp);
                    objRes = { estatus: kCorrecto, data: resResp, errorUs: null, errorNeg: null };
                }
                else {
                    objRes = { estatus: kErrorAut, data: null, errorUs: 'Error en usuario o Password', errorNeg: null };
                }
            }
            else {
                console.log('❌ Error usuario password');
                objRes = { estatus: kErrorAut, data: null, errorUs: 'Error en usuario o Password', errorNeg: null };
            }
        }
        else {
            objRes = { estatus: kErrorAut, data: null, errorUs: 'Error en usuario o Password', errorNeg: null };
        }
    }
    else {
        objRes = { estatus: kErrorAut, data: null, errorUs: 'Error en usuario o Password', errorNeg: null };
    }
    return objRes;
}
export async function creaUsuario(header, data) {
    console.log('✅ Header ', header);
    console.log('✅ data ', data);
    const sequelize = await getInstancia();
    const infUsuario = data;
    const passEnc = await hash(infUsuario.PASSWORD);
    infUsuario.PASSWORD = passEnc;
    const contexto = 'Registro de Usuario';
    const nomModelo = 'FC_SEG_USUARIO';
    const model = sequelize.models[nomModelo];
    const resData = await ejecFuncion(createRecord, header, contexto, model, infUsuario);
    return resData;
}
async function buscaByKey(model, data) {
    console.log('✅ Model', model);
    const existingRecord = await findOneByPrimaryKey(model, data);
    if (existingRecord && existingRecord.data && existingRecord.data.length > 0 && existingRecord.data[0]?.dataValues) {
        return existingRecord.data[0].dataValues;
    }
    else {
        return null;
    }
}
function creaUsuarioDummy(cveUsuario) {
    const kActivo = 'A';
    const kEspanol = 'ES';
    const usuario = {
        CVE_USUARIO: cveUsuario,
        APELLIDO_PATERNO: ' ',
        APELLIDO_MATERNO: ' ',
        NOMBRE: ' ',
        PASSWORD: ' ',
        B_BLOQUEADO: false,
        SIT_USUARIO: kActivo,
        CVE_IDIOMA: kEspanol,
        CVE_PERFIL: 'administrador'
    };
    return usuario;
}
