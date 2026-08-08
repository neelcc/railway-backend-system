import express from "express";
import { asyncWrapper } from "../utils/wrapper";
import logger from "../config/logger";
import { ScheduleService } from "../services/scheduleService";
import { ScheduleController } from "../controllers/scheduleController";

export const router = express.Router();
const scheduleService = new ScheduleService();
const scheduleController = new ScheduleController(scheduleService, logger);


router.post("/schedule", asyncWrapper(scheduleController.createSchedule));





export default router;