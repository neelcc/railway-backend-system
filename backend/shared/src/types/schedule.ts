export type ScheduleStatus = "ACTIVE" | "CANCELLED";

export interface Schedule {
    id? : string;
    trainId: string;
    departureDate: Date | string;
    createdAt?: Date | string;
    updatedAt?: Date | string;
}


export interface getAllSchedulesParams {
    trainId?: string | undefined;
    status?: ScheduleStatus | undefined;
    date?: string | undefined;
}