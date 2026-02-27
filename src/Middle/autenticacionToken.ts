  import jwt from 'jsonwebtoken';
  import { envConfig } from '@config/index.js';
  import { I_Header} from '@modelos/index.js';
  import { Request, Response, NextFunction } from 'express';
  import { CustomJwtPayload } from '@modelos/index.js'; 
  import { userContext} from '@middle/index.js'
  import { GetCache } from '@util/MemoCache.js';


  const palabraSegura = envConfig.PASS_SEC || 'No hay clave';

  /*
  export const authenticateToken = (req: Request, res: Response, next: NextFunction): any => {
    console.log('✅ Entro a Autenticacion');
    
    // 1. Extraemos el token de la cookie
    const tipoMeta = 'L';
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

    // 2. Validación de Lista Negra
    const instCache = GetCache(tipoMeta);
    const meta: any = instCache.get(token);
    if (meta) {
        console.log('❌ Token en lista negra');
        return res.status(401).json({
            estatus: kErrorAut,
            data: null,
            errorUs: 'Acceso denegado. Token inválido o sesión cerrada.',
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

      // ESCENARIO 1: El token es real pero el tiempo se agotó
      if (error instanceof jwt.TokenExpiredError) {
        console.error('❌ El token es invalido');
        return res.status(401).json({
          estatus: kErrorAut,
          data: null,
          errorUs: 'Tu sesión ha expirado. Por favor, intenta renovar.', // Mensaje de expiración
          errorNeg: ['TOKEN_EXPIRED'] // Código técnico para el Frontend
        });
      } 

      // ESCENARIO 2: El token es falso, está mal firmado o fue manipulado
      // (JsonWebTokenError captura firmas inválidas, tokens mal formados, etc.)
      console.error('❌ La cookie es invalida');
      return res.status(401).json({
        estatus: kErrorAut,
        data: null,
        errorUs: 'La sesión es inválida. Seguridad comprometida.', // Mensaje de invalidez
        errorNeg: ['INVALID_TOKEN'] // Código técnico para el Frontend
      });
    }
  }; */

  /**
 * Inicializa el contexto de ejecución para usuarios no autenticados (Guest/Público)
 */

export const authenticateToken = (req: Request, res: Response, next: NextFunction): any => {
    const token = req.cookies?.auth_token;
    
    // Validaciones de negocio (No generan folio de error en DB)
    if (!token) {
        return res.status(401).json({
            estatus: 4,
            data: null,
            errorUs: 'Acceso denegado. No se encontró una sesión activa.',
            errorNeg: null
        });
    }
// Validación de Token en lista negra por cierre de sesion
    const instCache = GetCache('L');
    if (instCache.get(token)) {
        return res.status(401).json({
            estatus: '04',
            errorUs: 'Sesión inválida o cerrada.',
            errorNeg: null
        });
    }

    // Si esto falla, el error "sube" a ejecFuncion automáticamente
    const decoded = jwt.verify(token, palabraSegura) as CustomJwtPayload;

    const header: I_Header = {
        idProceso: req.body.idProceso ?? 9999,
        cveAplicacion: decoded.cveAplicacion,
        cveUsuario: decoded.cveUsuario,
        cveIdioma: decoded.cveIdioma,
        cvePerfil: decoded.cvePerfil
    };

    return userContext.run(header, () => {
        req.datosUsuario = decoded; 
        return next(); 
    });
};


