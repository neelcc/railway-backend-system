import { NextFunction, Request, Response } from "express";
import { Station } from "../types";
import prisma from "../config/prisma";
import createHttpError from "http-errors";
import logger from "../config/logger";

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

        const station = await prisma.station.create({
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
        
        return station;
    }

}