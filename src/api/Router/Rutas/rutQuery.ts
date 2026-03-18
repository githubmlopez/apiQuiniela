import { Router } from 'express';
import { ctrlExecQuery, ctrlExecProcedure, ctrlGetMe} from '@router/index.js';

import { verificaCache, validatePublicProcess} from '@middle/index.js';

export const router = Router();

router.post('/Consulta', validatePublicProcess, verificaCache, ctrlExecQuery);
router.post('/Procedure', validatePublicProcess, verificaCache, ctrlExecProcedure);
router.post('/GetMe',  validatePublicProcess, ctrlGetMe);

export default router;
