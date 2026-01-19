import jwt from 'jsonwebtoken';
import { envConfig } from '@config/index.js';
import { I_Header} from '@modelos/index.js';
import { Request, Response, NextFunction } from 'express';
import { CustomJwtPayload } from '@modelos/index.js'; 
import { AsyncLocalStorage } from 'async_hooks';

export const userContext = new AsyncLocalStorage<I_Header>();

const palabraSegura = envConfig.PASS_SEC || 'No hay clave';
const kErrorAut = 4;

export const authenticateToken = (req: Request, res: Response, next: NextFunction): any => {
  console.log('✅ Entro a Autenticacion');
  
  // 1. Extraemos el token de la cookie
  const token = req.cookies?.auth_token;

  // 2. Validación inmediata: Si no hay token, no perdemos tiempo verificando
  if (!token) {
    console.log('❌ No se encontró el token en las cookies');
    return res.status(401).json({
      estatus: kErrorAut,
      data: null,
      errorUs: 'Acceso denegado. No se encontró una sesión activa.',
      errorNeg: null
    });
  }

  try {
    // 3. Verificamos el token
    const decoded = jwt.verify(token, palabraSegura) as CustomJwtPayload;
    console.log('✅ Token verificado para:', decoded.cveUsuario);

    // Extraemos idProceso (del body o de donde lo esperes)
    const { idProceso } = req.body;

    // Formamos el objeto de contexto
    const header: I_Header = {
      idProceso: idProceso ?? 9999,
      cveAplicacion: decoded.cveAplicacion,
      cveUsuario: decoded.cveUsuario,
      cveIdioma: decoded.cveIdioma,
      cvePerfil: decoded.cvePerfil
    };

    // 4. Ejecutamos dentro del contexto de AsyncLocalStorage
    return userContext.run(header, () => {
      req.datosUsuario = decoded; 
      next(); // Importante: next() debe ir dentro del run para mantener el contexto vivo
    });

  } catch (error) {
    console.error('❌ Error en autenticación:', error);

    if (error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({
        estatus: kErrorAut,
        data: null,
        errorUs: 'Tu sesión ha expirado. Por favor, ingresa de nuevo.',
        errorNeg: null
      });
    }

    // Cualquier otro error de JWT (mal formado, firma inválida, etc.)
    return res.status(401).json({
      estatus: kErrorAut,
      data: null,
      errorUs: 'Token inválido o corrupto.',
      errorNeg: null
    });
  }
};
