import { RouteStationWithStation } from "./route";
import { SeatType, Train } from "./train";

export interface RouteCreatedEvent {
  id: string;
  trainId: string;
  routeStations: RouteStationWithStation[];
  train: Train | null;
}


export interface ScheduleEventSeat {
    seatId: string;
    seatNumber: number;
    seatType: SeatType;
    price: number;
}

export interface ScheduleEventRouteStation {
    stationId: string;
    stationName: string;
    stationCode: string;
    city: string;
    sequenceNumber: number;
    arrivalTime: string | null;
    departureTime: string | null;
    distanceFromOrigin: number;
}

export interface ScheduleEvent {
  scheduleId: string;
  trainId: string;
  trainNumber: string;
  trainName: string;
  coachName: string;
  totalSeats: number;
  departureDate: string | Date ;
  status: string;
  seats: ScheduleEventSeat[];
  route: ScheduleEventRouteStation[]; 
}