  import jwt from 'jsonwebtoken';
  import { envConfig } from '@config/index.js';
  import { I_Header} from '@modelos/index.js';
  import { Request, Response, NextFunction } from 'express';
  import { CustomJwtPayload } from '@modelos/index.js'; 
  import { userContext} from '@middle/index.js'
  import { GetCache } from '@util/MemoCache.js';


  const palabraSegura = envConfig.PASS_SEC || 'No hay clave';

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


