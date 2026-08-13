import cors from 'cors';
import { Config } from '../config';

const allowedOrigins = Config.ALLOWED_ORIGINS
     ? Config.ALLOWED_ORIGINS.split(',').map(o => o.trim())
     : [];

export const corsMiddleware = cors({
     origin: function (origin, callback) {

          if (!origin) return callback(null, true);

          if (allowedOrigins.includes(origin)) {
               callback(null, true);
          } else {
                 callback(new Error('Not allowed by CORS'));
          }
     },
     credentials: true,
     methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
     allowedHeaders: ['Content-Type', 'Authorization'],
});