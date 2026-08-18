import { Station } from "./station";

export interface RouteStation {
    id: string;
    routeId: string;
    stationId: string;
    sequenceNumber: number;
    arrivalTime: string | null;
    departureTime: string | null;
    distanceFromOrigin: number;
}

export interface Route {
    trainId: string;
    stations: RouteStation[];
}

export type RouteStationWithStation = RouteStation & {
  station: Station;
};
