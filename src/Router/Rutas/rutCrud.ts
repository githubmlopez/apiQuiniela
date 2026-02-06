import { Router } from 'express';
import
{ ctrCrudCreate, ctrCrudUpdate, ctrCrudDelete, ctrCrudBulkC,ctrCrudBulkU, ctrFindByKey }
from '@router/index.js';
import { runPublicContext} from '@middle/index.js';
import { validatePublicProcess} from '@middle/index.js';
import { verificaCache} from '@middle/index.js';

runPublicContext

export const router = Router();

// rutLogin.js (o rutLogin.ts) contiene la lógica para definir las
//  rutas específicas para /api/login.
router.post('/Crea', validatePublicProcess, verificaCache,ctrCrudCreate);
router.post('/Modifica', validatePublicProcess, verificaCache, ctrCrudUpdate);
router.post('/Borra', validatePublicProcess, verificaCache, ctrCrudDelete);
router.post('/BulkC', validatePublicProcess, verificaCache, ctrCrudBulkC);
router.post('/BulkU', validatePublicProcess, verificaCache, ctrCrudBulkU);
router.post('/FindByKey', validatePublicProcess, ctrFindByKey);

// export const userContext = new AsyncLocalStorage<I_Header>();

export default router;