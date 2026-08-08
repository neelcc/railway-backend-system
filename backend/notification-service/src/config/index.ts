import { config } from "dotenv";
import path from "path";

// Load environment file based on NODE_ENV
config({
    path: path.join(process.cwd(), `.env.${process.env.NODE_ENV || "dev"}`),
});

function required(value: string | undefined, name: string): string {
    if (!value) {
        console.log(name);

        throw new Error(`Missing required environment variable: ${name}`);
    }
    return value;
}

export const Config = {
    PORT: Number(required(process.env.PORT, "PORT")),
    NODE_ENV: required(process.env.NODE_ENV, "NODE_ENV"),
    ALLOWED_ORIGINS: required(process.env.ALLOWED_ORIGINS, "ALLOWED_ORIGINS"),
    KAFKA_CLIENT_ID : required(process.env.KAFKA_CLIENT_ID , "KAFKA_CLIENT_ID") ,
    KAFKA_CLIENT_BROKER : required(process.env.KAFKA_CLIENT_BROKER , "KAFKA_CLIENT_BROKER") , 
    SENDGRID_API_KEY: required(process.env.SENDGRID_API_KEY, "SENDGRID_API_KEY"),
    SENDGRID_FROM_EMAIL: required(process.env.SENDGRID_FROM_EMAIL, "SENDGRID_FROM_EMAIL"),

} as const;
