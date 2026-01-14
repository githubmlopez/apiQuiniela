import { Router } from 'express';
import
{ ctrlForgotPassword }
from '@router/index.js';
export const router = Router();

// rutLogin.js (o rutLogin.ts) contiene la lógica para definir las
//  rutas específicas para /api/login.
router.get('/SendEmail', ctrlForgotPassword);

export default router;