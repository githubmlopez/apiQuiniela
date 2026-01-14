import { Request, Response } from 'express';
import {login}  from '@router/index.js';
import { I_Autentica, I_Header, I_InfResponse} from '@modelos/index.js';
import { ejecFuncion, creaHeadEsq} from '@util/index.js';

const kCorrecto = 1;
const kErrorSistema = 2;

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
      res.cookie('auth_token', tokenParaCookie, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
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
      res.status(500).json({ 
      estatus: kErrorSistema, 
      data: null, 
      errorUs: 'Error al cerrar sesión',
      errorNeg: null 
    });
  }  
}


