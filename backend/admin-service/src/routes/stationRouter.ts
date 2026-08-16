import express from "express";
import { asyncWrapper } from "../utils/wrapper";
import logger from "../config/logger";
import { StationController } from "../controllers/stationController";
import { StationService } from "../services/stationService";

export const router = express.Router();
const stationService = new StationService();
const stationController = new StationController(stationService, logger);


router.post("/station", asyncWrapper(stationController.createStation));
router.get("/station", asyncWrapper(stationController.getAllStations));

export default router;



