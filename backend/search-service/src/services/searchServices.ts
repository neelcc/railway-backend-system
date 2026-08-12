import { RouteCreatedEvent, RouteStation, RouteStationWithStation, ScheduleEvent, Station, Train, TrainWithSeats } from "@irctc/shared/src/types/index";
import { esClient, STATION_INDEX, ROUTE_INDEX, TRAIN_INDEX } from "../config/elasticSearch";
import createHttpError from "http-errors";
import logger from "../config/logger";
import { SearchTrainsQuery } from "../types/types";
import { SearchCompletionSuggestOption } from "@elastic/elasticsearch/lib/api/types";

export class SearchService {

    constructor() { }

    indexStation = async (station: Station) => {

        if (!station) {
            throw createHttpError(400, "Station data is required for indexing");
        }

        try {
            await esClient.index({
                index: STATION_INDEX,
                document: {
                    stationId: station.id,
                    name: station.name,
                    code: station.code,
                    city: station.city,
                    state: station.state,
                    suggest: {
                        input: [station.name, station.city, station.code].filter(Boolean),
                        weight: 10
                    },
                    refresh: true
                }
            })

            logger.info(`Indexed station ${station.name} : (${station.code})`);

        } catch (error) {
            logger.error(`Failed to index station: ${error}`);
        }



    }

    indexTrainRoute = async (routeCreatedEvent: RouteCreatedEvent) => {
        const { trainId, train, routeStations } = routeCreatedEvent
        if (!train && !routeStations) {
            throw createHttpError(400, "Train and RouteStation data is required for indexing");
        }

        const seatSummary = { total: 0, LOWER: 0, MIDDLE: 0, UPPER: 0, SIDE_LOWER: 0, SIDE_UPPER: 0 };

        (train.seats || []).forEach(s => {
            seatSummary.total++
            if (s.seatType !== undefined) {
                seatSummary[s.seatType]++;
            }
        })

        const doc = {
            trainId: trainId,
            trainNumber: train.trainNumber,
            trainName: train.trainName,
            route: routeStations.map((rs) => ({
                stationId: rs.id,
                stationName: rs.station.name,
                stationCode: rs.station.code,
                sequenceNumber: rs.sequenceNumber,
                arrivalTime: rs.arrivalTime,
                departureTime: rs.departureTime,
                distanceFromOrigin: rs.distanceFromOrigin,
            })),
            schedules: [],
            seatSummary,
        }

        await esClient.index({
            index: ROUTE_INDEX,
            id: trainId,
            document: doc,
            refresh: "true"
        })

        for (const rs of routeStations) {
            await esClient.index({
                index: STATION_INDEX,
                id: rs.station.id,
                document: {
                    stationId: rs.station.id,
                    name: rs.station.name,
                    code: rs.station.code,
                    city: rs.station.city,
                    suggest: {
                        input: [rs.station.name, rs.station.code, rs.station.city].filter(Boolean),
                        weight: 10,
                    },
                },
                refresh: true,
            });
        }


        logger.info(`Indexed train ${train.trainNumber} with ${routeStations.length} stations`);

    }

    indexSchedule = async (scheduleEvent: ScheduleEvent) => {
        const { scheduleId, trainId, departureDate, status, seats } = scheduleEvent;

        const totalSeats = seats ? seats.length : 0;

        try {

            await esClient.update({
                index: TRAIN_INDEX,
                id: trainId,
                script: {
                    source: `
            if (ctx._source.schedules == null) { ctx._source.schedules = []; }
            // Remove existing schedule with same id (idempotent)
            ctx._source.schedules.removeIf(s -> s.scheduleId == params.scheduleId);
            ctx._source.schedules.add(params.newSchedule);
          `,
                    params: {
                        scheduleId,
                        newSchedule: {
                            scheduleId,
                            departureDate,
                            status,
                            available: totalSeats,
                            locked: 0,
                            booked: 0,
                        },
                    },
                },
                refresh: true,
            });


            logger.info(`Indexed schedule ${scheduleId} for train ${trainId}`);
        } catch (err) {
            logger.warn(`Could not index schedule for train ${trainId}: ${err}`);
        }
    };

    // searchTrains = async ({ from, to, date }: SearchTrainsQuery) => {

    //     if(!from || !to) {
    //         throw createHttpError(400, "Both 'from' and 'to' station codes are required for searching trains.");
    //     }


    //     const fromStation = await this.resolvedStation(from);
    //     const toStation = await this.resolvedStation(to);

    //     const query = {
    //         bool: {
    //             must: [
    //                 {
    //                     nested: {
    //                         path: "route",
    //                         query: {
    //                             term: { "route.stationId": fromStation?.id }
    //                         },
    //                         inner_hits : {
    //                             name: 'from_station',
    //                         }
    //                     }
    //                 },
    //                 {
    //                     nested: {
    //                         path: "route",
    //                         query: {
    //                             term: { "route.stationId": toStation?.id }
    //                         },
    //                         inner_hits : {
    //                             name: 'to_station',
    //                         }
    //                     }
    //                 }
    //             ]
    //         }
    //     }

    //     const result = await esClient.search({
    //         index: TRAIN_INDEX,
    //         query: query,
    //         size: 50

    //     })

    //      const normalize = (d) => new Date(d).toISOString().slice(0, 10);

    //     result.hits.hits.map((hit) => {

    //         const source = hit._source;
    //         const fromHit = hit.inner_hits?.from_station?.hits.hits[0]?._source as RouteStationWithStation;
    //         const toHit = hit.inner_hits?.to_station?.hits.hits[0]?._source as RouteStationWithStation;

    //         if(!fromHit || !toHit || fromHit.sequenceNumber >= toHit.sequenceNumber) {
    //             return null;
    //         }

    //         let scheduleInfo = null;

    //             if (date && source.schedules && source.schedules.length > 0) {
    //                 scheduleInfo = source.schedules.find(
    //                      (s) => s.status === 'ACTIVE' && normalize(s.departureDate) === date
    //                 ) || null;
    //            }

    //            return {
    //                 trainId: source.trainId,
    //                 trainNumber: source.trainNumber,
    //                 trainName: source.trainName,
    //                 // --- SEGMENT BOOKING: Added stationId and sequenceNumber to from/to for segment-aware booking ---
    //                 from: { name: fromHit.station.name, code: fromHit.station.code, departure: fromHit.departureTime, stationId: fromHit.stationId, sequenceNumber: fromHit.sequenceNumber },
    //                 to: { name: toHit.station.name, code: toHit.station.code, arrival: toHit.arrivalTime, stationId: toHit.stationId, sequenceNumber: toHit.sequenceNumber },
    //                 seatSummary: source.seatSummary,
    //                 schedule: scheduleInfo,
    //            };


    //     })


    // }

    // resolvedStation = async (stationIdentifier: string) => {

    //     const exactResult = await esClient.search({
    //         index: STATION_INDEX,
    //         query: {
    //             term: { "code": stationIdentifier }
    //         }
    //     })

    //     if (exactResult.hits.hits.length > 0) {
    //         const source = exactResult.hits.hits[0]!._source as Station;
    //         if (source) return source;
    //     }

    //     try {


    //         const suggestResult = await esClient.search({
    //             index: STATION_INDEX,
    //             suggest: {
    //                 station_suggest: {
    //                     prefix: stationIdentifier,
    //                     completion: {
    //                         field: "suggest",
    //                         fuzzy: {
    //                             fuzziness: 'AUTO'
    //                         },
    //                         size: 1

    //                     }
    //                 }

    //             }
    //         })

    //         const options =
    //             suggestResult.suggest?.station_suggest?.[0]?.options;

    //         if (Array.isArray(options)) {
    //             const option = options[0] as SearchCompletionSuggestOption<Station>;
    //             return option._source
    //         }


    //     } catch (error) {
    //         logger.warn(`Suggest fallback failed: ${error}`);  
    //     }

    //     const fuzzyResult = await esClient.search({
    //         index: STATION_INDEX,
    //         query: {
    //             multi_match: {
    //                 query: stationIdentifier,
    //                 fields: ['name', 'city'],
    //                 fuzziness: 'AUTO',
    //                 prefix_length: 1,
    //             },
    //         },
    //         size: 1,
    //     });

    //     if (fuzzyResult.hits.hits.length > 0) {
    //         const source = fuzzyResult.hits.hits[0]?._source as Station
    //         if (source) {
    //             return source;
    //         }
    //         return null;
    //     }

    // }



}






