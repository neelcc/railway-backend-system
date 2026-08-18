import { NextFunction, Request, Response } from "express";
import { ScheduleService } from "../services/scheduleService";
import { Logger } from "winston";
import createHttpError from "http-errors";
import { getAllSchedulesParams } from "@irctc/shared/src/types/schedule";

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

    cancelSchedule = async (req: Request, res: Response, next: NextFunction) => {

        const { scheduleId } = req.params as { scheduleId: string };

        if(!scheduleId) {
            const error = createHttpError(400, 'scheduleId is required');
            return next(error);
        }

        const result = await this.scheduleService.cancelSchedule(scheduleId);

        res.status(200).json({
            status : 'success',
            message : 'Schedule cancelled successfully',
            data : result
        });

    }

    getAllSchedules = async (req: Request, res: Response, next: NextFunction) => {

        const { trainId, status, date } = req.query as getAllSchedulesParams;

        const result = await this.scheduleService.getAllSchedules({ trainId, status, date });

        res.status(200).json({
            status : 'success',
            message : 'Schedules fetched successfully',
            data : result
        });


    }

}