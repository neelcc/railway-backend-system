
export type SeatType = "LOWER" | "MIDDLE" | "UPPER" | "SIDE_LOWER" | "SIDE_UPPER";


export interface Seat {
    id: string;
    trainId: string;
    seatNumber: number;
    seatType: SeatType;
    price: number;
} 

export interface  Train {
    id?: string;
    trainNumber: string;
    trainName: string;
    coachName: string;
    totalSeats?: number;
    createdAt?: Date;
    updatedAt?: Date;
    seats: Seat[];
}


export type TrainWithSeats = Train & {
  seats: Seat[];
};