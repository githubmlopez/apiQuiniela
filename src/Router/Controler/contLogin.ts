import { envConfig } from '@config/index.js';
import { CustomJwtPayload } from '@modelos/index.js'; 
import jwt from 'jsonwebtoken';
import { Request, Response } from 'express';
import {login}  from '@router/index.js';
import { I_Autentica, I_Header, I_InfResponse} from '@modelos/index.js';
import { ejecFuncion, creaHeadEsq} from '@util/index.js';
import { GetCache, putCache} from '@util/index.js';

const kCorrecto = 1;
const kErrorSistema = 2;
const kErrorAut = 4;
const palabraSegura = envConfig.PASS_SEC || 'No hay clave';

export async function ctrlLogin(req : Request, res : Response) {
 
  const requestBody : I_Autentica = req.body;
  const idProceso = requestBody.idProceso;
  const cveAplicacion = requestBody.cveAplicacion;
  const cveUsuario = requestBody.cveUsuario;
  const password = requestBody.password;
  const header : I_Header = creaHeadEsq(cveAplicacion);
  header.idProceso = idProceso;
  header.cveUsuario = cveUsuario;
  header.cveAplicacion = cveAplicacion;
  header.cveIdioma  = ' ';
  header.cvePerfil  = ' ';
  const contexto = 'Proceso de Login';

  try {
  const result : I_InfResponse = await ejecFuncion(login, header, contexto, idProceso, cveAplicacion, cveUsuario, password)
  if (result.estatus === kCorrecto && result.data?.[0] != null) {
    const usuarioInfo = result.data[0];

    if (usuarioInfo.token) {
      // 3. Extraemos el token para la cookie
      const tokenParaCookie = usuarioInfo.token;

      // 4. CONFIGURAMOS LA COOKIE EN EL RESPONSE (res)
      // secure : Si es verdadero solo opera en HTTPS 
      res.cookie('auth_token', tokenParaCookie, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
//        maxAge: 1 * 60 * 1000,
         maxAge: 12 * 60 * 60 * 1000, // 12 horas
        path: '/',
      });

      // 5. LIMPIEZA: Eliminamos el token de la información del usuario
      // Al ser un Record<string, any>, delete funciona perfectamente.
      result.data = null; 
    }

    res.status(200).json(result);
   } else {
    console.log('❌ Error en usuario o Password');
    res.status(422).json
    ({estatus: kErrorSistema, data :null, errorUs: 'Error en usuario o Password', errorNeg : null});
  }
  } catch (error) { 
    console.log('❌ Error en usuario o Password');
    res.status(422).json
    ({estatus: kErrorSistema, data :null, errorUs: 'Error en usuario o Password', errorNeg : null});
  }
}

export async function ctrlLogout(req: Request, res: Response) {
  try { 
    //bEl token de la cookie de registra en la lista negra para que no puedan ser usados
    const token = req.cookies?.auth_token;
    const kLNegra = 'L';
    const cacheL = 'cacheLnegra';
    const objDataL = [{llave : token, valor : new Date()}];

    const instCache = GetCache(kLNegra)
    putCache(kLNegra, instCache, objDataL);

    // 1. Instrucción para que el navegador borre la cookie
    res.clearCookie('auth_token', {
      path: '/',
      httpOnly: true,
      sameSite: 'strict',
      // secure: true // Actívalo solo cuando tengas HTTPS (Producción)
    });

    // 2. Respuesta informativa para el Frontend
      res.status(200).json({ 
      estatus: kCorrecto, 
      data: null, 
      errorUs: null,
      errorNeg: null
    });

  } catch (error) {
      console.log('❌ Error Cerrar Sesion', error);
      res.status(500).json({ 
      estatus: kErrorSistema, 
      data: null, 
      errorUs: 'Error al cerrar sesión',
      errorNeg: null 
    });
  }  
}

export async function ctrlRefresh(req: Request, res: Response) {
  console.log('🔄 Intento de renovación de token');

  // 1. Obtenemos el token de la cookie
  const tokenViejo = req.cookies?.auth_token;

  if (!tokenViejo) {
      res.status(401).json({
      estatus: kErrorAut,
      data: null,
      errorUs: 'No se encontró sesión para renovar.',
      errorNeg: null
    });
    return;
  }

  try {
    // 2. Verificamos el token ignorando la expiración
    // Esto nos permite recuperar cveUsuario, perfil, etc., del token caducado
    console.log('✅ Verificando Token');
    const decoded = jwt.verify(tokenViejo, palabraSegura, { 
      ignoreExpiration: true 
    }) as CustomJwtPayload;

    // 3. Generamos el nuevo Token con el mismo tiempo de tu Login (12h)
    console.log('✅ Generando Nuevo Token');
    const nuevoToken = jwt.sign(
      { 
        cveAplicacion: decoded.cveAplicacion, 
        cveUsuario: decoded.cveUsuario, 
        cveIdioma: decoded.cveIdioma,
        cvePerfil: decoded.cvePerfil 
      },
      palabraSegura,
      { expiresIn: '12h' }
    );

    // 4. Actualizamos la COOKIE (Resetea el contador de 12h en el Browser)
    // secure : Si es verdadero solo opera en HTTPS 
    console.log('✅ Actualizando Token');
    res.cookie('auth_token', nuevoToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 12 * 60 * 60 * 1000, // 12 horas coincidiendo con el token
      path: '/',
    });

    console.log('✅ Token renovado exitosamente para:', decoded.cveUsuario);

    res.status(200).json({
    estatus: kCorrecto,
    data: { mensaje: 'Sesión extendida' },
    errorUs: null,
    errorNeg: null
    });

  } catch (error) {
    console.error('❌ Error crítico en refresh:', error);
      res.status(401).json({
      estatus: kErrorAut,
      data: null,
      errorUs: 'No fue posible renovar la sesión de seguridad.',
      errorNeg: null
    });
  }
}
