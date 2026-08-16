export interface  Station {
    id? : string;
    name: string;
    code: string;
    city: string;
    state: string;
    createdAt?: Date;
    updatedAt?: Date;
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
    id? : string
    trainNumber: string;
    trainName: string;
    coachName: string;
    seats: Seat[];
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

export type TrainWithSeats = Train & {
  seats: Seat[];
};


export type RouteStationWithStation = RouteStation & {
  station: Station;
};

    
export interface RouteCreatedEvent {
  id: string;
  trainId: string;
  routeStations: RouteStationWithStation[];
  train: TrainWithSeats;
}

export interface ScheduleEvent {

  scheduleId: string;
  trainId: string;
  departureDate: string;
  status: string;
  seats: Seat[];

}