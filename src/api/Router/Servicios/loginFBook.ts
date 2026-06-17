import { envConfig } from '@config/index.js';
import { getInstancia } from '@config/index.js';
import { Sequelize} from 'sequelize';
import jwt from 'jsonwebtoken';
import { findOneByKeyService} from '@router/index.js';
import { ejecFuncion, creaHeadEsq} from '@util/index.js'
import { I_Header, I_InfResponse, I_FC_SEG_USUARIO} from '@modelos/index.js';

const kCorrecto = 1;
const kErrorSistema = 2;
const kActivo = 'A'; 

export async function loginFacebook(
  idProceso: number, 
  cveAplicacion: string, 
  fbAccessToken: string
): Promise<I_InfResponse> {
  
  const sequelize: Sequelize = await getInstancia();
  const _sign = jwt.sign;
  const contexto = 'Proceso login Facebook';

  try {
    // 1. Validar con el Graph API de Facebook
    // Esto actúa como nuestro "verify" de contraseña
    const fbResponse = await fetch(`https://graph.facebook.com/me?fields=id,first_name,last_name,email&access_token=${fbAccessToken}`);
    const fbData = await fbResponse.json();

    if (!fbData.email) {
      return { estatus: kErrorSistema, data: null, errorUs: 'No se pudo obtener el email de Facebook', errorNeg: null };
    }

    const cveUsuario = fbData.email.trim().toLowerCase(); // Tu identificador principal
    const model: any = sequelize.models['FC_SEG_USUARIO'];
    const header: I_Header = creaHeadEsq(cveAplicacion);
    header.idProceso = idProceso;
    header.cveUsuario = cveUsuario;

    // 2. Buscar si el usuario ya existe en tu tabla
    const data = { CVE_USUARIO: cveUsuario };
    
   type FindUserFunction = (...args: any[]) => Promise<I_FC_SEG_USUARIO | null>;

   const resData : I_FC_SEG_USUARIO | null = await ejecFuncion<FindUserFunction>
    (
        // Función a ejecutar
        findOneByKeyService, 
        // Parámetros de ejecFuncion
        header, 
        contexto, 
        // Parámetros de findOneByKeyService (model, data, header, options...)
        model, 
        data, 
        header
    );

    // 3. Si NO existe, lo creamos (Auditoría automática de nuevo usuario)
    if (resData === null) {

 /*     resData = await model.create({
        CVE_USUARIO: cveUsuario,
        NOMBRE: `${fbData.first_name} ${fbData.last_name}`,
        SIT_USUARIO: kActivo,
        B_BLOQUEADO: false,
        CVE_IDIOMA: 'ES',
        CVE_PERFIL: 'CLIENTE', // O el perfil por defecto que manejes
        // PASSWORD se queda nulo o vacío ya que entra por Social Login
      });
*/
      console.log('✅ Nuevo usuario registrado vía Facebook para auditoría');
    }

    // 4. Validar estado del usuario (Igual que en tu login normal)
    if (resData && resData.SIT_USUARIO === kActivo && !resData.B_BLOQUEADO) {
      
      const token = _sign(
        { 
          cveAplicacion: cveAplicacion, 
          cveUsuario: resData.CVE_USUARIO, 
          cveIdioma: resData.CVE_IDIOMA,
          cvePerfil: resData.CVE_PERFIL
        },
        envConfig.PASS_SEC,
        { expiresIn: '12h' }
      );

      return {
        estatus: kCorrecto,
        data: [{ token: token }],
        errorUs: null,
        errorNeg: null
      };
    } else {
      return { estatus: kErrorSistema, data: null, errorUs: 'Usuario bloqueado o inactivo', errorNeg: null };
    }

  } catch (error) {
    console.error('❌ Error en loginFacebook:', error);
    return { estatus: kErrorSistema, data: null, errorUs: 'Error de comunicación con el servicio de autenticación', errorNeg: null };
  }
}