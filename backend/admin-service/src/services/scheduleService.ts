import createHttpError from "http-errors";
import prisma from "../config/prisma";
import { Prisma } from "../generated/prisma/client";
import { getAllSchedulesParams, Schedule } from "@irctc/shared/src/types/schedule";
import { adminProducer } from "../kafka/producer/adminProducer";

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


         const eventPayload = {
          scheduleId: schedule.id,
          trainId: train.id,
          trainNumber: train.trainNumber,
          trainName: train.trainName,
          coachName: train.coachName,
          totalSeats: train.totalSeats,
          departureDate: departureDate,
          status: schedule.status,
          seats: train.seats.map((s) => ({
               seatId: s.id,
               seatNumber: s.seatNumber,
               seatType: s.seatType,
               price: s.price,
          })),
          route: train.route.routeStations.map((rs) => ({
               stationId: rs.station.id,
               stationName: rs.station.name,
               stationCode: rs.station.code,
               city: rs.station.city,
               sequenceNumber: rs.sequenceNumber,
               arrivalTime: rs.arrivalTime,
               departureTime: rs.departureTime,
               distanceFromOrigin: rs.distanceFromOrigin,
          })),
        };

        await adminProducer.publishScheduleCreated(eventPayload);

     
        return schedule;

    }

    cancelSchedule = async ( scheduleId : string ) => {

        const schedule = await prisma.schedule.findUnique({
            where : {
                id : scheduleId
            }
        });

        if(!schedule) {
            const error = createHttpError(404, 'Schedule not found');
            throw error;
        }

        if(schedule.status === 'CANCELLED') {
            const error = createHttpError(400, 'Schedule is already cancelled');
            throw error;
        }

        const updatedSchedule = await prisma.schedule.update({
            where : {
                id : scheduleId,
            },
            data : {
                status : 'CANCELLED'
            }
        }); 

        await adminProducer.publishScheduleCancelled(updatedSchedule);

        return updatedSchedule;

    }

    getAllSchedules = async ( query: getAllSchedulesParams = {}) => {

        const where : Prisma.ScheduleWhereInput = {};

        if(query.trainId) {
            where.trainId = query.trainId;
        }

        if(query.status) {
            where.status = query.status;
        }

        if(query.date) {
            where.departureDate = query.date;
        }

        const schedules = await prisma.schedule.findMany({
            where,
            include : {
                train : {
                    include : {
                        route : {
                            include : {
                                routeStations : {
                                    include : { station : true },
                                    orderBy : { sequenceNumber : 'asc' }
                                }
                            }
                        }
                    }
                }
            },
            orderBy : {
                departureDate : 'asc'
            }
        });
        return schedules;
    }



}