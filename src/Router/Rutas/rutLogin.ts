
import { Router } from 'express';
import { ctrlLogin} from '../Controler/index.js';
import { ctrlUsuario} from '../Controler/index.js';

export const router = Router();

// rutLogin.js (o rutLogin.ts) contiene la lógica para definir las
//  rutas específicas para /api/login.
router.post('/Autentica', ctrlLogin);
router.post('/Usuario', ctrlUsuario);
export default router;


