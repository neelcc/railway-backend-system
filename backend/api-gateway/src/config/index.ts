import { config } from "dotenv";
import path from "path";
import ms, { StringValue } from "ms"


config({
    path: path.join(process.cwd(), `.env.${process.env.NODE_ENV || "dev"}`),
});

function required(value: string | undefined, name: string): string {
     if (!value) {
        console.log(`Missing required environment variable: ${name}`);
        process.exit(1);
     }  
     return value;
    }

export const Config = {
     PORT: process.env.PORT || 4000,
     SERVICE_NAME: require('../../package.json').name,
     NODE_ENV: required(process.env.NODE_ENV, 'NODE_ENV') || 'development',

     REDIS_URL: required(process.env.REDIS_URL, 'REDIS_URL'),
     ALLOWED_ORIGINS: required(process.env.ALLOWED_ORIGINS, 'ALLOWED_ORIGINS') || 'http://localhost:3000',

     JWT_ACCESS_SECRET: required(process.env.JWT_ACCESS_SECRET, 'JWT_ACCESS_SECRET'),
     JWT_REFRESH_SECRET: required(process.env.JWT_REFRESH_SECRET, 'JWT_REFRESH_SECRET'),
     ACCESS_TOKEN_EXP: required(process.env.ACCESS_TOKEN_EXP, 'ACCESS_TOKEN_EXP') as StringValue ,
     REFRESH_TOKEN_EXP: required(process.env.REFRESH_TOKEN_EXP, 'REFRESH_TOKEN_EXP'),
     ACCESS_TOKEN_EXP_SEC: parseInt(required(process.env.ACCESS_TOKEN_EXP_SEC, 'ACCESS_TOKEN_EXP_SEC') || '900', 10),
     REFRESH_TOKEN_EXP_SEC: parseInt(required(process.env.REFRESH_TOKEN_EXP_SEC, 'REFRESH_TOKEN_EXP_SEC') || '604800', 10),

     RATE_LIMIT_WINDOW_MS: parseInt(required(process.env.RATE_LIMIT_WINDOW_MS, 'RATE_LIMIT_WINDOW_MS') || '900000', 10),
     RATE_LIMIT_MAX_REQUESTS: parseInt(required(process.env.RATE_LIMIT_MAX_REQUESTS, 'RATE_LIMIT_MAX_REQUESTS') || '100', 10),

     SERVICES: {
          USER_SERVICE_URL: required(process.env.USER_SERVICE_URL, 'USER_SERVICE_URL'),
          // SEARCH_SERVICE_URL: required(process.env.SEARCH_SERVICE_URL, 'SEARCH_SERVICE_URL'),
          // ADMIN_SERVICE_URL: required(process.env.ADMIN_SERVICE_URL, 'ADMIN_SERVICE_URL'),
          // NOTIFICATION_SERVICE_URL: required(process.env.NOTIFICATION_SERVICE_URL, 'NOTIFICATION_SERVICE_URL'),
          // BOOKING_SERVICE_URL: required(process.env.BOOKING_SERVICE_URL, 'BOOKING_SERVICE_URL'),
          // PAYMENT_SERVICE_URL: required(process.env.PAYMENT_SERVICE_URL, 'PAYMENT_SERVICE_URL'),
          // INVENTORY_SERVICE_URL: required(process.env.INVENTORY_SERVICE_URL, 'INVENTORY_SERVICE_URL')
     },

     SERVICE_TIMEOUT_MS: parseInt(required(process.env.SERVICE_TIMEOUT_MS, 'SERVICE_TIMEOUT_MS') || '60000', 10),

     CIRCUIT_BREAKER_THRESHOLD: parseInt(required(process.env.CIRCUIT_BREAKER_THRESHOLD, 'CIRCUIT_BREAKER_THRESHOLD') || '5', 10),
     CIRCUIT_BREAKER_TIMEOUT: parseInt(required(process.env.CIRCUIT_BREAKER_TIMEOUT, 'CIRCUIT_BREAKER_TIMEOUT') || '60000', 10),
};