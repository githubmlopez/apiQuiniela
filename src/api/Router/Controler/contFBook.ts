import { Request, Response } from 'express';
import { I_InfResponse} from '@modelos/index.js';
import {loginFacebook}  from '@router/index.js';

const kCorrecto = 1;
const kErrorSistema = 2;
export async function ctrlLoginFacebook(req: Request, res: Response) {
  const { fbAccessToken, idProceso, cveAplicacion } = req.body;
  const contexto = 'Login via Facebook';

  try {
    // Llamamos a una nueva función lógica específica para Facebook
    const result: I_InfResponse = await loginFacebook(idProceso, cveAplicacion, fbAccessToken);

    if (result.estatus === kCorrecto && result.data?.[0]?.token) {
      const tokenParaCookie = result.data[0].token;

      // Reutilizamos tu configuración de cookie
      res.cookie('auth_token', tokenParaCookie, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 12 * 60 * 60 * 1000,
        path: '/',
      });

      result.data = null; // Limpieza por seguridad igual que en tu login normal
      res.status(200).json(result);
    } else {
      res.status(422).json(result);
    }
  } catch (error) {
    console.error('❌ Error en Auth Facebook:', error);
    res.status(500).json({ estatus: kErrorSistema, data: null, errorUs: 'Error al autenticar con Facebook' });
  }
}