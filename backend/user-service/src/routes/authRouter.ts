import express from "express";

const router = express.Router();

import { asyncWrapper } from "../utils/wrapper";
import { AuthService } from "../services/authService";
import { AuthController } from "../controllers/authController";
import logger from "../config/logger";

const authService = new AuthService(logger);
const authController = new AuthController(authService,logger);

router.post("/send-otp", asyncWrapper(authController.sendOtp));
router.post("/verify-otp", asyncWrapper(authController.verifyOtp));
router.post("/login" , authController.login)
router.post("/refresh" , authController.rotateRefreshToken)
    

export default router;