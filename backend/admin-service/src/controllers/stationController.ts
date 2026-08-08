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

}