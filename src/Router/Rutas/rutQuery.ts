import { Router } from 'express';
import { ctrlExecQuery, ctrlExecProcedure, ctrlGetMe} from '@router/index.js';

export const router = Router();

// rutLogin.js (o rutLogin.ts) contiene la lógica para definir las
//  rutas específicas para /api/login.
router.post('/Consulta', ctrlExecQuery);
router.post('/Procedure', ctrlExecProcedure);
router.post('/GetMe',  ctrlGetMe);

export default router;


