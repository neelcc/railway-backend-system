import express from "express";
import { UserService } from "../services/userService";
import { UserController } from "../controllers/userController";
import logger from "../config/logger";
import { asyncWrapper } from "../utils/wrapper";
import { AuthenticatedRequest } from "../config/types";
import { getUserContext } from "../middlewares/getUserContext";



const router = express.Router();
const userService = new UserService();
const userController = new UserController(userService, logger);



router.get("/profile" , getUserContext , asyncWrapper((req,res,next) => userController.getProfile(req as AuthenticatedRequest, res, next)) )


export default router;


