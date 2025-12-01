import jwt from 'jsonwebtoken';
import { envConfig } from '../index.js';
const palabraSegura = envConfig.PASS_SEC || 'No hay clave';
const kErrorAut = 4;
export const authenticateToken = (req, res, next) => {
    console.log('✅Entro a Autenticacion');
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        res.status(401).json({ estatus: kErrorAut, data: null, errorUs: 'Acceso denegado. No se proporcionó token',
            errorNeg: null });
        return; // Detiene la ejecución del middleware
    }
    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
        res.status(401).json({ estatus: kErrorAut, data: null, errorUs: 'Formato de token inválido. Se esperaba "Bearer <token>',
            errorNeg: null });
        return;
    }
    const token = parts[1];
    try {
        // Verifica el token
        const decoded = jwt.verify(token, palabraSegura);
        console.log('✅Ejecuto verify', decoded);
        req.datosUsuario = decoded; // Puedes usar 'req.usuario', 'req.authData', etc.
        console.log('✅Actualizo request ');
        next(); // Permite que la solicitud continúe a la siguiente función (tu controlador)
    }
    catch (error) {
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
