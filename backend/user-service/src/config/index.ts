import { config } from "dotenv";
import path from "path";
import ms, { StringValue } from "ms"

// Load environment file based on NODE_ENV
config({
    path: path.join(process.cwd(), `.env.${process.env.NODE_ENV || "development"}`),
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
    REDIS_URL   : required(process.env.REDIS_URL, "REDIS_URL"),
    DATABASE_URL: required(process.env.DATABASE_URL, "DATABASE_URL"),
    SENDGRID_API_KEY: required(process.env.SENDGRID_API_KEY, "SENDGRID_API_KEY"),
    SENDGRID_FROM_EMAIL: required(process.env.SENDGRID_FROM_EMAIL, "SENDGRID_FROM_EMAIL"),
    SALT_ROUNDS: Number(required(process.env.SALT_ROUNDS, "SALT_ROUNDS")),
    OTP_TTL: Number(required(process.env.OTP_TTL, "OTP_TTL")),
    ATTEMPT_MAX: Number(required(process.env.ATTEMPT_MAX, "ATTEMPT_MAX")),
    RATE_MAX: Number(required(process.env.RATE_MAX, "RATE_MAX")),
    JWT_REFRESH_SECRET : required(process.env.JWT_REFRESH_SECRET,"JWT_REFRESH_SECRET")  ,
    JWT_ACCESS_SECRET : required(process.env.JWT_ACCESS_SECRET,"JWT_ACCESS_SECRET")  ,
    ACCESS_TOKEN_EXP : required(process.env.ACCESS_TOKEN_EXP , "ACCESS_TOKEN_EXP") as StringValue ,
    REFRESH_TOKEN_EXP : required(process.env.REFRESH_TOKEN_EXP , "REFRESH_TOKEN_EXP") as StringValue ,
    ACCESS_TOKEN_EXP_SEC : Number(required(process.env.ACCESS_TOKEN_EXP_SEC , "ACCESS_TOKEN_EXP_SEC")),
    REFRESH_TOKEN_EXP_SEC : Number(required(process.env.REFRESH_TOKEN_EXP_SEC , "REFRESH_TOKEN_EXP_SEC")),
    REDIS_USER_TTL : Number(required(process.env.REDIS_USER_TTL , "REDIS_USER_TTL")),
    KAFKA_CLIENT_ID : required(process.env.KAFKA_CLIENT_ID , "KAFKA_CLIENT_ID") ,
    KAFKA_CLIENT_BROKER : required(process.env.KAFKA_CLIENT_BROKER , "KAFKA_CLIENT_BROKER") ,


} as const;
