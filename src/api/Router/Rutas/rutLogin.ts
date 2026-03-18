
import { Router } from 'express';
import { ctrlLogin, ctrlLogout, ctrlRefresh} from '@router/index.js';

export const router = Router();

// rutLogin.js (o rutLogin.ts) contiene la lógica para definir las
//  rutas específicas para /api/login.
router.post('/Autentica', ctrlLogin);
router.post('/Logout', ctrlLogout);
router.post('/Refresh', ctrlRefresh);
export default router;


