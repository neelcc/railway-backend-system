import createHttpError from "http-errors";
import { redis } from "../config/redis";
import { OtpMeta } from "../config/types";
import otpGenerator from "otp-generator";
import crypto from "crypto";
import bcrypt from "bcrypt";
import { Config } from "../config";

export const generateAndStoreOtp = async (meta : OtpMeta) => {

    const rateKey = `otp:rate:${meta.email}`;
    console.log(`Checking rate limit for email: ${meta.email} with key: ${rateKey}`);
     const sentCount = parseInt(await redis.get(rateKey) || '0', 10);

     console.log(`Sent count for ${meta.email}: ${sentCount}`);

     if(sentCount >= Config.RATE_MAX) {
        const error = createHttpError(429, "Too many OTP requests. Please try again later.");
        throw error;
     }

    const otp = otpGenerator.generate(6, { upperCaseAlphabets: false, specialChars: false, lowerCaseAlphabets: false, digits: true });


    const otpSessionId = crypto.randomUUID();

    const hashedOtp = await bcrypt.hash(otp, 5);
    
    console.log(`Generated OTP: ${otp} for email: ${meta.email}, hashed as: ${hashedOtp}, session ID: ${otpSessionId}`);

    const data = await redis.set(`otp:session:${otpSessionId}`, JSON.stringify({
          hashedOtp: hashedOtp,
          meta
     }), 'EX', Config.OTP_TTL);

     console.log(`Stored OTP session in Redis for session ID: ${otpSessionId}, result: ${data}`);

     await redis.incr(rateKey);

     await redis.get(`otp:session:${otpSessionId}`)

     await redis.expire(rateKey, 3600);

    return { otp: otp, otpSessionId: otpSessionId };

}

export const verifyOtp = async (otp: string, otpSessionId: string) => {


    const rawData = await redis.get(`otp:session:${otpSessionId}`);


     if(!rawData) return null;

    const {hashedOtp: storedOtp, meta} = JSON.parse(rawData);

     const attemptsKey = `otp:attempts:${meta.email}`;
     const attemptsCount = parseInt(await redis.get(attemptsKey) || '0', 10);
     
     if(attemptsCount >= Config.ATTEMPT_MAX) {
        const error = createHttpError(429, "Too many OTP verification attempts. Please try again later.");
        throw error;
     }


    const isValid = await bcrypt.compare(otp.toString(), storedOtp);

     if(!isValid) {
        await redis.incr(attemptsKey);
        await redis.expire(attemptsKey, Config.OTP_TTL);
        return null;
     }else{
         await redis.del(`otp:session:${otpSessionId}`, attemptsKey);
               await redis.del(`otp:rate:${meta.email}`);
               return meta;
     }

}

