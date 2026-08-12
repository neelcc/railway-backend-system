import { Config } from "../config";
import logger from "../config/logger";
import prisma from "../config/prisma";
import { redis } from "../config/redis";
import { User } from "../config/types";

export class UserService {
    
    async getProfile(userId: string){

    const user = await redis.get(`user:${userId}`);
    if(user){
        logger.info("User found in cache");
        return JSON.parse(user);    
    }

    const userFromDb = await prisma.user.findUnique({
        where: {
            id: userId
        }
    });

    if(userFromDb){
        const {password: _password, ...safeUser} = userFromDb;
         await redis.set(`user:${userId}`, JSON.stringify(safeUser), 'EX', Config.REDIS_USER_TTL);
    }


    }
}