import { Logger } from "winston";
import { UserService } from "../services/userService";
import { NextFunction, Request, Response } from "express";
import { AuthenticatedRequest } from "../config/types";

export class UserController {


    constructor(private userService : UserService, private logger: Logger){

    }
    
    getProfile = async(req: AuthenticatedRequest, res: Response, next: NextFunction) => {

        const userId = req.user.sub; 
        const result = await this.userService.getProfile(userId);
        

        res.status(200).json({
            "message" : "Success",
            "data" : result
        })
    }

}