import { Logger } from "winston";
import { SearchService } from "../services/searchServices";
import { NextFunction, Request, Response } from "express";
import createHttpError from "http-errors";
import { SearchTrainsQuery } from "../types/types";

export class SearchController {
    
    constructor( private searchService : SearchService, private logger : Logger  ) {}

    // searchTrains = async (req: Request< {}, {}, {}, SearchTrainsQuery >, res: Response, next: NextFunction) => {

    //     const  { from, to, date } = req.query ;
        
    //     if(!from || !to ) {
    //         throw createHttpError(400, "Missing required query parameters: from, to, date");
    //     }

    //     const result = await this.searchService.searchTrains({ from, to, date });
    //     res.status(200).json(result);


    // }

}

