import * as express from 'express';
import { CustomJwtPayload } from '@modelos/index.js';

// Declara la extensión del módulo 'express'
declare global {
  namespace Express {
    // Extiende la interfaz Request
    interface Request {
      // Define la nueva propiedad 'user' y su tipo
      datosUsuario: CustomJwtPayload; // Usa el tipo de tu payload JWT. Puede ser 'any' si prefieres menos tipado estricto, pero 'JwtPayload' es mejor.
    }
  }
}
