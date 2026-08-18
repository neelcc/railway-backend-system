// export interface  Station {
//     id? : string;
//     name: string;
//     code: string;
//     city: string;
//     state: string | null;
//     createdAt?: Date;
//     updatedAt?: Date;
//   }
// export type ScheduleStatus = "ACTIVE" | "CANCELLED";
// export type SeatType = "LOWER" | "MIDDLE" | "UPPER" | "SIDE_LOWER" | "SIDE_UPPER";


// export interface Seat {
//     id: string;
//     trainId: string;
//     seatNumber: number;
//     seatType: SeatType;
//     price: number;
// } 

// export interface  Train {
//     id?: string;
//     trainNumber: string;
//     trainName: string;
//     coachName: string;
//     totalSeats?: number;
//     createdAt?: Date;
//     updatedAt?: Date;
//     seats: Seat[];
// }

// export interface RouteStation {
//     id: string;
//     routeId: string;
//     stationId: string;
//     sequenceNumber: number;
//     arrivalTime: string | null;
//     departureTime: string | null;
//     distanceFromOrigin: number;

// }

//   export interface Route {
//       trainId: string;
//       stations: RouteStation[];
//   }

// export interface Schedule {
//     trainId: string;
//     departureDate: string;
// }

// export type TrainWithSeats = Train & {
//   seats: Seat[];
// };


// export type RouteStationWithStation = RouteStation & {
//   station: Station;
// };

    
// export interface RouteCreatedEvent {
//   id: string;
//   trainId: string;
//   routeStations: RouteStationWithStation[];
//   train: Train | null;
// }

// export interface ScheduleSeat {
//     seatId: string;
//     seatNumber: number;
//     seatType: SeatType;
//     price: number;
// }

// export interface ScheduleRouteStation {
//     stationId: string;
//     stationName: string;
//     stationCode: string;
//     city: string;
//     sequenceNumber: number;
//     arrivalTime: string | null;
//     departureTime: string | null;
//     distanceFromOrigin: number;
// }

// export interface ScheduleEvent {
//   scheduleId: string;
//   trainId: string;
//   trainNumber: string;
//   trainName: string;
//   coachName: string;
//   totalSeats: number;
//   departureDate: string;
//   status: string;
//   seats: ScheduleSeat[];
//   route: ScheduleRouteStation[]; 
// }
  
// // export type TrainCreatedEvent = Seat[]  {
    
// // }
