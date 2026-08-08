import { Request } from "express";

export interface User {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    emailVerified?: boolean;
}

export interface OtpMeta {
    firstName: string;
    lastName: string;
    email: string;
    hashedPassword: string;
}   

export interface AuthenticatedRequest extends Request {
    user: {
        sub: string;
    };
}
