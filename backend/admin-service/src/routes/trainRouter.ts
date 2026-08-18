import express from "express";
import { TrainController } from "../controllers/trainController";
import { asyncWrapper } from "../utils/wrapper";
import { TrainService } from "../services/trainService";
import logger from "../config/logger";

const router = express.Router();
const trainService = new TrainService();
const trainController = new TrainController(trainService, logger);



router.post("/train", asyncWrapper(trainController.createTrain));
router.get("/train/:trainId", asyncWrapper(trainController.getTrainById));
router.get("/train", asyncWrapper(trainController.getAllTrains)); 
router.post("/route", asyncWrapper(trainController.createRoute));
router.post("/routes/:trainId", asyncWrapper(trainController.deleteRoute));

export default router;





