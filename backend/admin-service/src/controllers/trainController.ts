import { NextFunction, Request, Response } from "express";
import { TrainService } from "../services/trainService";
import { Logger } from "winston";
import createHttpError from "http-errors";

export class TrainController {

    constructor(private trainService : TrainService, private logger : Logger) {
        
    }

    createTrain = async (req: Request, res: Response, next: NextFunction) => {

        const { trainNumber, trainName, seats, coachName } = req.body;

        if(!trainNumber || !trainName || !seats || !coachName) {
            const error = createHttpError(400, 'Missing required fields: trainNumber, trainName, seats, coachName');
            return next(error);
        }

        if(seats.length === 0) {
            const error = createHttpError(400, 'Seats array cannot be empty');
            return next(error);
        }

        const result = await this.trainService.createTrain({ trainNumber, trainName, seats, coachName });

        res.status(201).json({
            status: "success",
            message: "Train created successfully",
            data: result
        });

    }

    createRoute = async (req: Request, res: Response, next: NextFunction) => {
        const { trainId, stations } = req.body;

        if(!trainId || !stations) {
            const error = createHttpError(400, 'Missing required fields: trainId, stations');
            return next(error);
        }

        if(stations.length < 2) {
            const error = createHttpError(400, 'At least two stations are required to create a route');
            return next(error);
        }

        const result = await this.trainService.createRoute({ trainId, stations });

        res.status(201).json({
            status: "success",
            message: "Route created successfully",
            data: result
        });


    }

    getTrainById = async (req: Request, res: Response, next: NextFunction) => {

        const { trainId } = req.params as { trainId: string };

        if(!trainId) {
            const error = createHttpError(400, 'Missing required field: trainId');
            return next(error);
        }
        
        const result = await this.trainService.getTrainById(trainId);

        res.status(200).json({
            status: "success",
            message: "Train fetched successfully",
            data: result
        });

    }

    getAllTrains = async ( req: Request, res: Response, next : NextFunction ) => {

        const result = await this.trainService.getAllTrains();

        res.status(200).json({
            status: "success",
            message: "All trains fetched successfully",
            data: result
        });
        

    }



}