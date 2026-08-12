import { NextFunction, Request, Response } from "express";
import { Train, Route } from "../types";
import createHttpError from "http-errors";
import prisma from "../config/prisma";
import logger from "../config/logger";

export class TrainService {

    constructor() {}

    createTrain = async (trainData: Train  ) => {
        const { trainNumber, trainName, seats, coachName } = trainData;

        const existingTrain = await prisma.train.findUnique({
            where: {
                trainNumber: trainNumber
            }
        });

        if(existingTrain) {
            const error = createHttpError(409, 'Train with this number already exists');
            throw error;
        }

        const seatNumbers = seats.map((seat) => seat.seatNumber);

        if(new Set(seatNumbers).size !== seatNumbers.length) {
            const error = createHttpError(400, 'Duplicate seat numbers found in the seats array');
            throw error;
        }


        const train = await prisma.train.create({
            data : {
                trainNumber : trainNumber,
                trainName : trainName,
                totalSeats : seats.length,
                coachName : coachName,
                seats : {
                    create : seats.map((seat) => ({
                        seatNumber : seat.seatNumber,
                        seatType : seat.seatType,
                        price : seat.price
                    }))
                },
            },
            include : {
                seats : {
                    orderBy : {
                        seatNumber : 'asc'
                    }
                }
            }
        });

        logger.info(`Train created successfully: ${train.trainName} (${train.trainNumber})`);

        return train;

    }

    createRoute = async ( routeData : Route ) => {

        const { trainId, stations } = routeData;

        const existingTrain = await prisma.train.findUnique({
            where : {
                id : trainId
            }
        });

        if(!existingTrain) {
            const error = createHttpError(404, 'Train not found');
            throw error;
        }

        const existingRoute = await prisma.route.findUnique({
            where : {
                trainId 
            }
        })

        if(existingRoute){
            const error = createHttpError(400,"Route already exixts")
            throw(error);
        }

        const stationIds = stations.map((s)=> s.id)

        const existingStations = await prisma.station.findMany({
            where : {
                id : {
                    in: stationIds
                }
            }
        })


        if(existingStations.length !== stations.length){
            const error = createHttpError(404, 'One or more stations not found');
            throw error;
        }

        const sorted = [...stations].sort((a, b) => a.sequenceNumber - b.sequenceNumber);

        for (let i = 0; i < sorted.length - 1; i++) {
            if (sorted[i].sequenceNumber === sorted[i + 1].sequenceNumber) {
                const error = createHttpError(400, 'Duplicate sequence numbers found in the stations array');
                throw error;
            }
        }
        
        const route = await prisma.route.create({
            data : {
                trainId : trainId,
                routeStations : {
                    create : stations.map((s)=>({
                        stationId : s.stationId,
                        sequenceNumber : s.sequenceNumber,
                        arrivalTime : s.arrivalTime,
                        departureTime : s.departureTime || null,
                        distanceFromOrigin : s.distanceFromOrigin || 0
                        
                    }))
                }
            },
            include : {
                routeStations : {
                    include : {station : true},
                    orderBy : { sequenceNumber : 'asc' }
                }
            }
        })
        
         const trainWithSeats = await prisma.train.findUnique({
          where: { id: trainId },
          include: { seats: { orderBy: { seatNumber: 'asc' } } },
     });
        
     // publish route + trainwithseats

     return route

    }

}