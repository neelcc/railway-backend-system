import prisma from "../config/prisma";
import { OtpMeta, User } from "../config/types";
import bcrypt from "bcrypt";
import { generateAndStoreOtp, verifyOtp } from "../utils/otp";
import createHttpError from "http-errors";
import jwt, { JwtPayload } from "jsonwebtoken"
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from "../utils/auth";
import { Config } from "../config";
import { redis } from "../config/redis";
import logger from "../config/logger";
import { notificationProducer } from "../kafka/producer/notificationProducer";
import { sendOtpEmail } from "../utils/email";
import { Logger } from "winston";

export class AuthService {

    constructor(private logger: Logger){

    }

    async sendOtp(user : User) {
        
        const existingUser = await prisma.user.findUnique({
            where: {
                email: user.email
            }
        });

        if(existingUser) {
            const error = createHttpError(409, 'User already existxs');
            throw error;
        }

        const hashedPassword = await bcrypt.hash(user.password, 10);
        
        const meta = { firstName: user.firstName, lastName: user.lastName, email: user.email, hashedPassword: hashedPassword };

        const { otp , otpSessionId } = await generateAndStoreOtp(meta);

        this.logger.info("otp and otpsessionId" , otp,otpSessionId)


        // await sendOtpEmail(user.email, otp);
        // await notificationProducer.sendOtpEmail(meta.email, otp)


        return { 
            otpSessionId: otpSessionId,
            otp: otp
         };
    }

    async verifyOtp(otp: string, otpSessionId: string) {
        
        
     const meta : OtpMeta = await verifyOtp(otp, otpSessionId);
    
     if(meta === null){
        const error = createHttpError(400, 'Invalid OTP or OTP session expired');
        throw error;
     }

     const user = await prisma.user.create({
        data: {
            firstName: meta.firstName,
            lastName: meta.lastName,
            email: meta.email,
            password: meta.hashedPassword,
            emailVerified: true
        }
     })

        // await notificationProducer.sendWelcomeEmail(meta.email, otp)
    
     logger.info(`Welcome email queued for ${meta.email}`);

     return user;
     
    }

    async getUserByEmail(email : string){

        return await prisma.user.findUnique({
            where : {
                email : email
            }
        })

    }

    async login(email:string,password:string,deviceId:string){
        
        if(!email || !password){
          throw createHttpError({ message: 'Missing Email or Password' });
        }

        const existingUser = await this.getUserByEmail(email)

        if(!existingUser){
          throw createHttpError(404, { message: 'User does not exist' });
        }

        if(!existingUser.password)
        {
            throw createHttpError(400, { message: 'This account was created with Google. Please sign in with Google.' });
        }
        const doesPasswordMatch = bcrypt.compare(password,existingUser.password)

        if(!doesPasswordMatch){
            throw createHttpError(400, { message: 'Invalid email or password' });
        }

         const accessToken = generateAccessToken(existingUser.id);
         const refreshToken = generateRefreshToken(existingUser.id);
         const {jti}  = jwt.decode(refreshToken) as JwtPayload ;
         if(!jti){
            throw createHttpError(400, { message: 'Invalid Token' });
         }
        await redis.set(`refresh:${existingUser.id}:${deviceId}`, jti, 'EX', Config.REFRESH_TOKEN_EXP_SEC);
         const {password: _password, ...safeUser} = existingUser;
        console.log("safeuser   ",safeUser);
        
         await redis.set(`user:${existingUser.id}`, JSON.stringify(safeUser), 'EX', Config.REDIS_USER_TTL);
         return {accessToken, refreshToken, loggedInUser: safeUser};

    }

    async rotateRefreshToken(refreshToken : string , deviceId : string  ){
        
    const payload = verifyRefreshToken(refreshToken) as JwtPayload ;
     const {id: userId, jti} = payload as JwtPayload ;
     const storedJti = await redis.get(`refresh:${userId}:${deviceId}`);
     if(!storedJti){
          throw  createHttpError(400, "Session Expired")
     }
     if(storedJti !== jti){
          await redis.del(`refresh:${userId}:${deviceId}`);
          throw  createHttpError("Refresh token reused", "LOGIN AGAIN")
     }
     const newAccessToken = generateAccessToken(payload.id);
     const newRefreshToken = generateRefreshToken(payload.id);
  
     const {jti: newJti} = jwt.decode(newRefreshToken) as JwtPayload ;
     if(!newJti){
        throw createHttpError("Token error")
     }
     await redis.set(`refresh:${payload.id}:${deviceId}`, newJti, 'EX', Config.REFRESH_TOKEN_EXP_SEC);
     
     return {newAccessToken, newRefreshToken};

    }

    

    
}