import { NextFunction, Request, Response } from "express";
import { Station, getAllStationParams } from "@irctc/shared/src/types/station";
import prisma from "../config/prisma";
import createHttpError from "http-errors";
import logger from "../config/logger";
import { Prisma } from "../generated/prisma/client";
import { adminProducer } from "../kafka/producer/adminProducer";

export class StationService {

    constructor() {}

    createStation = async (stationData: Station) => {
        const { name, code, city, state } = stationData;

        const existingStation = await prisma.station.findUnique({
            where: {
                code: code
            }
        });

        if(existingStation) {
            const error = createHttpError(409, 'Station with this code already exists');
            throw error;
        }

        const   station = await prisma.station.create({
            data : {
                name : name,
                code : code,
                city : city,
                state : state,
                routeStations : {

                }
            }
        })

        logger.info(`Station created successfully: ${station.name} (${station.code})`);
        await adminProducer.publishStationCreated(station).catch((err) => {
          logger.error('Failed to publish station created event', { error: err.message });
     });
        return station;
    }

    getAllStations = async ( { search, page, limit } : getAllStationParams ) => {

        const limitValue = limit ? parseInt(limit) : 10;
        const pageValue = page ? parseInt(page) : 1;

        const skip = ( pageValue - 1 ) * limitValue;

        const where : Prisma.StationWhereInput = search ? {
            OR : [
                { code : { contains : search, mode : "insensitive" } },
                { name : { contains : search, mode : "insensitive" } },
                { city : { contains : search, mode : "insensitive" } },
            ]
        } : {}

        const [stations, total] = await Promise.all([
          prisma.station.findMany({
               where,
               skip,
               take: limitValue,
               orderBy: {
                    name: 'asc'
               }
          }),
          prisma.station.count({ where })
     ]);

        return { stations, total };

    }

    getStationById = async (id: string) => {
        const station = await prisma.station.findUnique({
            where: {
                id: id
            }
        });
        return station;
    }

}