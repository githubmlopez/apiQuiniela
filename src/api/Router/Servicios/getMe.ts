import { getInstancia } from '@config/index.js';
import { Sequelize } from 'sequelize';
import { findOneByKeyService } from '@router/index.js';
import { ejecFuncion, creaHeadEsq } from '@util/index.js';
import { ExecRawQueryById } from '@router/index.js';
import { envConfig } from '@config/index.js';
import { I_Header, I_InfResponse, I_FC_SEG_USUARIO } from '@modelos/index.js';

const kCorrecto = 1;
const kInfUsuario = '5';

export async function getMe(idProceso: number, cveAplicacion: string, cveUsuario: string): Promise<I_InfResponse> {
    console.log('✅ Iniciando getMe para:', cveUsuario);
    
    const sequelize: Sequelize = await getInstancia();
    const header: I_Header = creaHeadEsq(cveAplicacion);
    header.idProceso = idProceso;
    header.cveAplicacion = cveAplicacion;
    header.cveUsuario = cveUsuario;

    const data = { CVE_USUARIO: cveUsuario };
    const nomModelo = 'FC_SEG_USUARIO';
    const contexto = 'Proceso getMe / Login';
    const model: any = sequelize.models[nomModelo];

    type FindUserFunction = (...args: any[]) => Promise<I_FC_SEG_USUARIO | null>;

    // 1. Buscamos los datos básicos del usuario
    const resData: I_FC_SEG_USUARIO | null = await ejecFuncion<FindUserFunction>(
        findOneByKeyService,
        header,
        contexto,
        model,
        data,
        header
    );

    if (!resData) {
        throw new Error('Datos de Usuario Inexistentes en FC_SEG_USUARIO');
    }

    // 2. Actualizamos el header con lo obtenido
    header.cveIdioma = resData.CVE_IDIOMA;
    header.cvePerfil = resData.CVE_PERFIL;

    // 3. Consultamos la información extendida (Quiniela, Periodo, etc.)
    const idQuery = kInfUsuario;
    const parmRemp = { $1: cveUsuario };
    const resUsuario: I_InfResponse = await ejecFuncion(
        ExecRawQueryById, 
        header, 
        contexto, 
        idQuery, 
        parmRemp
    );

    if (resUsuario && resUsuario.data && Array.isArray(resUsuario.data) && resUsuario.data.length > 0) {
        const getMeData = resUsuario.data[0];

        // Armamos el objeto de respuesta final para el cliente
        const respuestaCliente = buildGetMeResponse(
        envConfig.SISTEMA,
        resData,
        getMeData,
        cveUsuario
        );
        console.log('✅ getMe finalizado con éxito para:', cveUsuario);

        return {
            estatus: kCorrecto,
            data: [respuestaCliente],
            errorUs: null,
            errorNeg: null
        };

    } else {
        throw new Error('No se encontró información extendida (Quiniela) para el usuario');
    }
}

export function buildGetMeResponse(
    sistema: string,
    resData: any,
    getMeData: any,
    cveUsuario: string
) {

    switch (sistema.toLowerCase()) {

        case 'quiniela':
            return buildQuinielaResponse(
                resData,
                getMeData,
                cveUsuario
            );

        case 'condom':
            return buildCondomResponse(
                resData,
                getMeData,
                cveUsuario
            );

        default:
            throw new Error(`Sistema ${sistema} no soportado.`);
    }

}


export function buildQuinielaResponse(
    resData: any,
    getMeData: any,
    cveUsuario: string
) {

    const parsedInfUsuario = JSON.parse(getMeData.infUsuario);
    const parsedInfPeriodo = JSON.parse(getMeData.infPeriodo);
    const parsedInfQuiniela = JSON.parse(getMeData.InfQuiniela);
    const parsedInfSurvivor = JSON.parse(getMeData.infSurvivor);

    return {

        cveUsuario,

        cveIdioma: resData.CVE_IDIOMA,
        cvePerfil: resData.CVE_PERFIL,

        nombreCompleto:
            `${resData.NOMBRE} ${resData.APELLIDO_PATERNO} ${resData.APELLIDO_MATERNO || ''}`.trim(),

        idQuiniela: parsedInfUsuario.ID_QUINIELA,
        idParticipante: parsedInfUsuario.ID_PARTICIPANTE,

        idPeriodo: parsedInfPeriodo.ID_PERIODO,
        bResSurv: parsedInfPeriodo.B_RES_SURV,
        fLimite: parsedInfPeriodo.F_LIMITE,
        horaLimite: parsedInfPeriodo.HORA_LIMITE,

        titQuiniela: parsedInfQuiniela.TIT_QUINIELA,
        idEquipoVa: parsedInfQuiniela.ID_EQUIPO_FAV,
        nomEquipoVa: parsedInfQuiniela.NOM_EQUIPO,

        nomEquipoFav: parsedInfSurvivor.NOM_EQUIPO,
        bSurvivor: parsedInfSurvivor.B_SURVIVOR

    };

}

export function buildCondomResponse(
    resData: any,
    getMeData: any,
    cveUsuario: string
) {

    // parseos completamente diferentes

    const infoUsuario = JSON.parse(getMeData.infoUsuarioCondom);

    return {

        cveUsuario,

        cveIdioma: resData.CVE_IDIOMA,
        cvePerfil: resData.CVE_PERFIL,

        nombreCompleto:
            `${resData.NOMBRE} ${resData.APELLIDO_PATERNO} ${resData.APELLIDO_MATERNO || ''}`.trim(),

        edificio: infoUsuario.EDIFICIO,
        departamento: infoUsuario.DEPARTAMENTO,
        administrador: infoUsuario.ADMINISTRADOR

    };

}

