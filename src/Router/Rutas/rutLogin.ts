
import { Router } from 'express';
import { ctrlLogin, ctrlLogout, ctrlGetMe} from '../Controler/index.js';

export const router = Router();

// rutLogin.js (o rutLogin.ts) contiene la lógica para definir las
//  rutas específicas para /api/login.
router.post('/Autentica', ctrlLogin);
router.post('/Logout', ctrlLogout);
export default router;


