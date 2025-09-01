import express from 'express';
import cors from 'cors';
import helmet from 'helmet';

import  loginRouter  from './Rutas/rutLogin.js';
import  queryRouter  from './Rutas/rutQuery.js';
import  queryCrud  from './Rutas/rutCrud.js';
import { authenticateToken } from '../index.js'

import { obtCorsOpt } from '../Middle/index.js';


export const app = express();

const allowedOrigins = ['http://localhost:3000', 'https://quiniela-frontend-next.vercel.app',
'https://b12519dc9462.ngrok-free.app', 'https://353cc0ca41c0.ngrok-free.app'];
const corsOptions = obtCorsOpt(allowedOrigins);

// Middlewares
app.use(helmet());
app.use(cors(corsOptions));
app.use(express.json());
// Le dice a Express que cualquier solicitud que comience con /api/login 
// debe ser manejada por el router que le estás pasando (que es rutLogin).
app.use('/api/Login', loginRouter);
app.use('/api/Query', authenticateToken, queryRouter);
app.use('/api/Crud', authenticateToken, queryCrud);



