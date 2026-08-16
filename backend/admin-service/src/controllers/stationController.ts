import { NextFunction, Request, Response } from "express";
import { Logger } from "winston";
import { StationService } from "../services/stationService";
import createHttpError from "http-errors";

export class StationController {

    constructor(private stationService : StationService, private logger : Logger) {
        
    }

    createStation = async (req: Request, res: Response, next: NextFunction) => {

        const { name, code, city, state } = req.body;

        if(!name || !code || !city || !state) {
            const error = createHttpError(400, "Missing required fields: name, code, city, state");
            this.logger.error(error.message);
            return next(error);
        }

        const result = await this.stationService.createStation({ name, code, city, state });

        res.status(201).json({
            status: "success",
            message: "Station created successfully",
            data: result
        });

    }

    getAllStations = async (req: Request, res: Response, next: NextFunction) => {

        const result = await this.stationService.getAllStations();

        res.status(200).json({
            status: "success",
            message: "Stations retrieved successfully",
            data: result
        });
    }

    getStationById = async (req: Request, res: Response, next: NextFunction) => {
        const { id } = req.params as { id: string };

        if(!id) {
            const error = createHttpError(400, "Missing required field: id");
            this.logger.error(error.message);
            return next(error);
        }

        const result = await this.stationService.getStationById(id);

        if(!result) {
            const error = createHttpError(404, "Station not found");
            this.logger.error(error.message);
            return next(error);
        }

        res.status(200).json({
            status: "success",
            message: "Station retrieved successfully",
            data: result
        });

    }

}