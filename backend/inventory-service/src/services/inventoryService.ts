import { ScheduleEvent } from "@irctc/shared/src/types/event";
import { Schedule } from "@irctc/shared/src/types/schedule";
import createHttpError from "http-errors";
import prisma from "../config/prisma";
import {  SeatStatus } from "../generated/prisma/client";
import logger from "../config/logger";
export class InventoryService {

    constructor(
    ) {}

    async initializeInventory( eventPayload : ScheduleEvent ) {
        const { scheduleId, trainId, trainName, departureDate ,seats, totalSeats, trainNumber  } = eventPayload; 

        if(!scheduleId || !trainId || !trainName || !departureDate || !seats) {
            const error = createHttpError(400, 'Missing required fields in event payload');
            throw error;
        }

        const eventKey = `SCHEDULE-CREATED:${scheduleId}`;

        const existingEvent = await prisma.idempotencyRecord.findUnique({
            where : {
                eventKey : eventKey
            }
        });

        if(existingEvent) {
            const error = createHttpError(409, 'Event already processed');
            throw error;
        }

        await prisma.$transaction(async (tx) => {

            const schedule = await tx.scheduleInventory.create({
                data : {
                    scheduleId,
                    trainId,
                    trainName,
                    trainNumber,
                    totalSeats,
                    departureDate : new Date(departureDate),
                    available : totalSeats,
                    booked : 0,
                    locked : 0,
                    status : 'ACTIVE',
                }
            })

        const seatData = seats.map(seat => ({
               scheduleInventoryId: schedule.id,
               scheduleId,
               seatId: seat.seatId,
               seatNumber: seat.seatNumber,
               seatType: seat.seatType,
               price: seat.price,
               status: SeatStatus.AVAILABLE,
          }));

          await tx.seatInventory.createMany({ data: seatData });

           if (eventPayload.route && eventPayload.route.length > 0) {
               const routeStopData = eventPayload.route.map(rs => ({
                    scheduleId,
                    stationId: rs.stationId,
                    stationName: rs.stationName,
                    stationCode: rs.stationCode,
                    sequenceNumber: rs.sequenceNumber,
               }));
               await tx.routeStop.createMany({ data: routeStopData });
               logger.info(`Persisted ${routeStopData.length} route stops for schedule ${scheduleId}`);
          }

          await tx.idempotencyRecord.create({ data: { eventKey } });

        })


    }

    async cancelScheduleInventory(eventPayload : Schedule) {
        const { trainId, departureDate, id } = eventPayload;

        const eventKey = `SCHEDULE-CANCELLED:${id}`;

        const existingEvent = await prisma.idempotencyRecord.findUnique({
            where : {
                eventKey : eventKey
            }
        });

        if(existingEvent) {
            const error = createHttpError(409, 'Event already processed');
            throw error;
        }

        const scheduleInventory = await prisma.scheduleInventory.findUnique({
            where : {
                scheduleId : id
            }
        });

        if(!scheduleInventory) {
            const error = createHttpError(404, 'Schedule inventory not found');
            throw error;
        }

        await prisma.$transaction(async (tx) => {

            await tx.scheduleInventory.update({
                where : {
                    scheduleId : id
                },
                data : {
                    status : 'CANCELLED',
                    booked : 0,
                    available : 0,
                    locked : 0,
                    version : {
                        increment : 1
                    }
                }
            });

            await tx.seatInventory.updateMany({
                where : {
                    scheduleId : id
                },
                data : {
                    status : SeatStatus.CANCELLED
                }
            });

            await prisma.idempotencyRecord.create({ data: { eventKey } });
        })


    }

}