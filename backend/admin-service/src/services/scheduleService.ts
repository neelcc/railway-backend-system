import createHttpError from "http-errors";
import prisma from "../config/prisma";
import { Schedule } from "../types";

export class ScheduleService {  


    createSchedule = async ( scheduleData: Schedule ) => {

        const { trainId, departureDate } = scheduleData;

        const train = await prisma.train.findUnique({
            where : {
                id : trainId
            },
            include : {
                seats : { orderBy : { seatNumber : 'asc' } },
                route : {
                    include : {
                        routeStations : {
                            include : { station : true },
                            orderBy : { sequenceNumber : 'asc' }
                        }
                    }
                }
            }

        })

        if(!train) {
            const error =  createHttpError(404, 'Train not found');
            throw error;
        }

        if(train.seats.length === 0) {
            const error = createHttpError(400, 'Train has no seats');
            throw error;
        }

        if(!train.route) {
            const error = createHttpError(400, 'Train has no route');
            throw error;
        }

        const parsedDate = new Date(departureDate);

        if(isNaN(parsedDate.getTime())) {
            const error = createHttpError(400, 'Invalid departure date fomat, expected format: YYYY-MM-DD');
            throw error;
        }

    // AND, createdat, updatedat, 


        const existingSchedule = await prisma.schedule.findUnique({
            where : {
                trainId_departureDate : {
                    trainId : trainId,
                    departureDate : parsedDate
                }
            }
        });

        if(existingSchedule) {
            const error = createHttpError(400, 'Schedule already exists for this train and departure date');
            throw error;
        }

        const schedule = await prisma.schedule.create({
            data : {
                trainId : trainId,
                departureDate : parsedDate
            }
        });

    }
    
}