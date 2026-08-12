import express from 'express';
import { createProxy } from '../service/proxy';
import { Config } from '../config';
import { authMiddleware } from '../middlewares/auth';

export const router = express.Router();

router.post('/auth/send-otp', createProxy('userService', Config.SERVICES.USER_SERVICE_URL ));

router.post('/auth/verify-otp', createProxy('userService', Config.SERVICES.USER_SERVICE_URL ));

router.post('/auth/login', createProxy('userService', Config.SERVICES.USER_SERVICE_URL ));

router.post('/auth/refresh', createProxy('userService', Config.SERVICES.USER_SERVICE_URL ));

router.get('/user/profile', authMiddleware ,createProxy('userService', Config.SERVICES.USER_SERVICE_URL ));
