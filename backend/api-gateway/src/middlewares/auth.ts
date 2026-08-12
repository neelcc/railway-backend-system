import { Request ,Response, NextFunction } from 'express';
import jwt, { JwtPayload,  } from 'jsonwebtoken';
import logger from '../config/logger';
import { AuthenticatedRequest } from '../config/types';
import { Config } from '../config';
import createHttpError from 'http-errors';

export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {

    try {
        const authHeader = req.headers.authorization;

        logger.info("Authorization header: " + authHeader);

        if (!authHeader) {
            return res.status(401).json({ message: 'Authorization header missing' });
        }   


        const token = authHeader.split(' ')[1];
        logger.info("Extracted token: " + token);

        if (!token) {
            return res.status(401).json({ message: 'Token missing' });
        }

    
        const decodedToken  =  jwt.verify(token, Config.JWT_ACCESS_SECRET) as JwtPayload | null;

        logger.info("Decoded token: " + JSON.stringify(decodedToken));

        if (!decodedToken) {
            return res.status(401).json({ message: 'Invalid token' });
        }

        logger.info("User ID from token: " + Object.values(decodedToken));
        logger.info("User ID from token: " + Object.keys(decodedToken));


        req.headers['x-user-id'] = decodedToken?.sub;


        next();

    }
    catch (err : unknown) {
        // console.error('Error in authMiddleware:', error);
         if (err instanceof Error && err.name === 'TokenExpiredError') {
               return next(createHttpError(500, 'Access token expired', 'TOKEN_EXPIRED'));
          }
          if (err instanceof Error && err.name === 'JsonWebTokenError') {
               return next(createHttpError(500, 'Invalid access token', 'TOKEN_INVALID'));
          }
        return next(err);
    }

}