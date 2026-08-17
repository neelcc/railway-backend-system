export interface Station {
    id? : string;
    name: string;
    code: string;
    city: string;
    state: string;
}

enum SeatType {
  LOWER = "LOWER",
  MIDDLE = "MIDDLE",
  UPPER = "UPPER",
  SIDE_LOWER = "SIDE_LOWER",
  SIDE_UPPER = "SIDE_UPPER"
}

export interface Seat {
    trainId: string;
    seatNumber: number;
    seatType: SeatType;
    price : number;
}

export interface Train {
    trainNumber: string;
    trainName: string;
    seats: Seat[];
    coachName: string;
}

export interface RouteStation {
    id: string;
    routeId: string;
    stationId: string;
    sequenceNumber: number;
    arrivalTime: string;
    departureTime: string;
    distanceFromOrigin: number;

}

export interface Route {
    trainId: string;
    stations: RouteStation[];
}

export interface Schedule {
    trainId: string;
    departureDate: string;
}


export interface getAllStationParams {
    search?: string | undefined ;
    page?: string | undefined ;
    limit?: string | undefined;
}

export enum ScheduleStatus {
    ACTIVE = "ACTIVE",
    CANCELLED = "CANCELLED"
}

export interface getAllSchedulesParams {
    trainId?: string | undefined;
    status?: ScheduleStatus | undefined;
    date?: string | undefined;
}