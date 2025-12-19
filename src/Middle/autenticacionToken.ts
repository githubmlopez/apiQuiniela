import jwt, { JwtPayload } from 'jsonwebtoken';
import { envConfig } from '../index.js';
import { I_Header} from '../index.js';
import { Request, Response, NextFunction } from 'express';
import { CustomJwtPayload } from '../index.js'; 
import { AsyncLocalStorage } from 'async_hooks';

export const userContext = new AsyncLocalStorage<I_Header>();

const palabraSegura = envConfig.PASS_SEC || 'No hay clave';
const kErrorAut = 4;

export const authenticateToken = (req : Request, res : Response, next : NextFunction) : any => {
  console.log('✅Entro a Autenticacion');
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    res.status(401).json
    ({estatus: kErrorAut, data :null, errorUs: 'Acceso denegado. No se proporcionó token',
      errorNeg : null});
    return; // Detiene la ejecución del middleware
  }

  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    res.status(401).json
    ({estatus: kErrorAut, data :null, errorUs: 'Formato de token inválido. Se esperaba "Bearer <token>',
      errorNeg : null});
    return;
  }

  const token = parts[1];
 
    try {
      // Verifica el token
      const decoded = jwt.verify(token, palabraSegura) as CustomJwtPayload;
      console.log('✅Ejecuto verify', decoded);
      const { idProceso } = req.body;

// Formamos el objeto completo
      const header: I_Header = {
      idProceso: idProceso ?? null,
      cveAplicacion: decoded.cveAplicacion,
      cveUsuario: decoded.cveUsuario,
      cveIdioma: decoded.cveIdioma,
      cvePerfil: decoded.cvePerfil
      };

// 🌟 GUARDAMOS EL HEADER COMPLETO EN EL CONTEXTO
      return userContext.run(header, () => {
      req.datosUsuario = decoded; // Lo dejamos en req solo por si acaso
      next();
      });

      console.log('✅Actualizo request ');

  //    next(); // Permite que la solicitud continúe a la siguiente función (tu controlador)
    } catch (error) {
  if (error instanceof jwt.TokenExpiredError) {
    return res.status(401).json({
      estatus: kErrorAut,
      data: null,
      errorUs: 'Token expirado',
      errorNeg: null
    });
  }

  if (error instanceof jwt.JsonWebTokenError) {
    return res.status(401).json({
      estatus: kErrorAut,
      data: null,
      errorUs: 'Token inválido',
      errorNeg: null
    });
  }   
  }
};
