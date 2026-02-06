import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';

import  {
loginRouter,
queryRouter,
crudRouter,
emailRouter } from '@router/index.js';
import { obtCorsOpt } from '@middle/index.js';

export const app = express();

const allowedOrigins = ['http://localhost:3000', 'http://localhost:3010', 'http://192.168.0.10:3000',
'https://fb635c365516.ngrok-free.app'];
const corsOptions = obtCorsOpt(allowedOrigins);

// Middlewares
app.use(helmet());
app.use(cors(corsOptions));
app.use(express.json());    
app.use(cookieParser());
// Le dice a Express que cualquier solicitud que comience con /api/login 
// debe ser manejada por el router que le estás pasando (que es rutLogin).
app.use('/api/Login', loginRouter);
app.use('/api/Query', queryRouter);
app.use('/api/Crud',  crudRouter);
app.use('/api/Email', emailRouter);



