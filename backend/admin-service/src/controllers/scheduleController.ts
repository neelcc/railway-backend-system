import { NextFunction, Request, Response } from "express";
import { ScheduleService } from "../services/scheduleService";
import { Logger } from "winston";
import createHttpError from "http-errors";

export class ScheduleController {

    constructor(private scheduleService: ScheduleService, private logger: Logger){}

    createSchedule = async (req: Request, res: Response, next: NextFunction) => {

      const  { trainId, departureDate } = req.body;

        if(!trainId || !departureDate) {
            const error =  createHttpError('trainId and departureDate are required');
            return next(error);
        }

        const result = await this.scheduleService.createSchedule( { trainId, departureDate } );


        res.status(201).json({
            status : 'success',
            message : 'Schedule created successfully',
            data : result
        });

    }

}