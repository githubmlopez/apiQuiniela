import { Router } from 'express';
import { ctrlExecQuery, ctrlExecProcedure, ctrlGetMe} from '@router/index.js';

import { verificaCache, validatePublicQuery} from '@middle/index.js';

export const router = Router();

router.post('/Consulta', validatePublicQuery, verificaCache, ctrlExecQuery);
router.post('/Procedure', validatePublicQuery, verificaCache, ctrlExecProcedure);
router.post('/GetMe',  validatePublicQuery, ctrlGetMe);

export default router;
