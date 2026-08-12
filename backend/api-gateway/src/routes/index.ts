import express from 'express';
import { createProxy } from '../service/proxy';
import { Config } from '../config';
import { authMiddleware } from '../middlewares/auth';

export const router = express.Router();

// Auth Routes 

const userServiceProxy = createProxy('userService', Config.SERVICES.USER_SERVICE_URL);


router.post('/auth/send-otp', userServiceProxy);

router.post('/auth/verify-otp', userServiceProxy);

router.post('/auth/login', userServiceProxy);

router.post('/auth/refresh', userServiceProxy);

router.get('/user/profile', authMiddleware, userServiceProxy);


// Admin Routes

const adminServiceProxy = createProxy('adminService', Config.SERVICES.ADMIN_SERVICE_URL);

router.post(
    '/admins/stations/station',
    authMiddleware,
    adminServiceProxy
);

router.post(
    '/admins/trains/train',
    authMiddleware,
    adminServiceProxy
);

router.post(
    '/admins/trains/route',
    authMiddleware,
    adminServiceProxy
)

router.post(
    '/admins/schedules/schedule',
    authMiddleware,
    adminServiceProxy
)

// router.get(
//     '/admins/stations/station',
//     authMiddleware,
//     adminServiceProxy
// )

// router.get(
//     '/admins/trains/train/:trainId',
//     authMiddleware,
//     adminServiceProxy
// );

// router.put(
//     '/admins/schedules/schedule/:scheduleId',
//     authMiddleware,
//     adminServiceProxy
// )