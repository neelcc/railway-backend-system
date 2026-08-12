import { Request, Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../config/types';
import logger from '../config/logger';

export const getUserContext = (req: Request, res: Response, next: NextFunction) => {

    const userContext = req.headers['x-user-id'] as string | undefined;

    logger.info("User context from header: " + userContext);

    if (!userContext) {
        return res.status(400).json({ message: 'User context header missing' });
    }

    logger.info("Type of user context: " + typeof userContext);

    (req as AuthenticatedRequest).user = { sub: userContext };

    console.log("User context set in request: " + (req as AuthenticatedRequest).user.sub);

    

    next();

}