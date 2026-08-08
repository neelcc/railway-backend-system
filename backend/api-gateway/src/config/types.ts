import { Request } from "express";

export interface AuthenticatedRequest extends Request {
    user : {
        id: string;
    }
}

export enum CircuitState {
    CLOSED = "CLOSED",
    OPEN = "OPEN",
    HALF_OPEN = "HALF_OPEN"
}