import { Router } from 'express';
import
{ ctrCrudCreate, ctrCrudUpdate, ctrCrudDelete, ctrCrudBulkC,ctrCrudBulkU, ctrFindByKey }
from '../Controler/index.js';
export const router = Router();

// rutLogin.js (o rutLogin.ts) contiene la lógica para definir las
//  rutas específicas para /api/login.
router.post('/Crea', ctrCrudCreate);
router.post('/Modifica', ctrCrudUpdate);
router.post('/Borra', ctrCrudDelete);
router.post('/BulkC', ctrCrudBulkC);
router.post('/BulkU', ctrCrudBulkU);
router.post('/FindByKey', ctrFindByKey);
//router.post('/FindByKey', ctrlExecQuery);



export default router;