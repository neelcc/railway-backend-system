import createHttpError from "http-errors";
import { Config } from "../config";
import logger from "../config/logger";
import { CircuitState } from "../config/types";
import { Request, Response , NextFunction } from "express";
import { IncomingHttpHeaders } from "http2";
import axios, { AxiosRequestConfig } from "axios";

export class CircuitBreaker {

    private failureCount : number = 0;
    private readonly failureThreshold : number;
    private readonly recoveryTimeout : number;   
    private nextAttempt : number;
    private state : CircuitState;                                                           

    constructor( private serviceName : string ) {
        this.failureThreshold = Config.CIRCUIT_BREAKER_THRESHOLD;
        this.recoveryTimeout = Config.CIRCUIT_BREAKER_TIMEOUT;
        this.nextAttempt = Date.now();
        this.state = CircuitState.CLOSED;
    }

    async execute<T>(request: () => Promise<T>) : Promise<T> {
        if(this.state == CircuitState.OPEN ){
            if(Date.now()<this.nextAttempt){
                const error =  createHttpError(503, `Circuit breaker is OPEN for ${this.serviceName}. Request blocked.`);
                logger.error(`Circuit breaker is OPEN for ${this.serviceName}. Request blocked.`);
                throw error;
            }

            this.state = CircuitState.HALF_OPEN;

        }

        try {
            
            const result = await request();
            this.onSuccess();
            logger.info(`Circuit breaker request successful for ${this.serviceName}.`);
            // logger.info(`Result: ${JSON.stringify(result)}`);
            return result;

        } catch (error) {
            this.onFailure();
            logger.error(`Circuit breaker error: ${error}`);
            throw error;
        }


    }

     onSuccess(){
        this.failureCount = 0;
        if(this.state === CircuitState.HALF_OPEN) {
            logger.info(`Circuit breaker is now CLOSED for ${this.serviceName}.`);
            this.state = CircuitState.CLOSED;
        }

    }

     onFailure(){
        this.failureCount++;
        logger.error(`Circuit breaker failure count for ${this.serviceName}: ${this.failureCount}`);
       if(this.failureCount >= this.failureThreshold ){
        
        this.state = CircuitState.OPEN
        this.nextAttempt = Date.now() + this.recoveryTimeout;
       }

    }


    }

const circuitBreakers = {
     userService: new CircuitBreaker('user-service'),
     searchService: new CircuitBreaker('search-service'),
     adminService: new CircuitBreaker('admin-service'),
     notificationService: new CircuitBreaker('notification-service'),
     bookingService: new CircuitBreaker('booking-service'),
     paymentService: new CircuitBreaker('payment-service'),
     inventoryService: new CircuitBreaker('inventory-service')
};


const forwardRequest = async(serviceUrl: string, path: string, method: string, body: unknown, headers: IncomingHttpHeaders, circuitBreaker: CircuitBreaker) => {

    const url = `${serviceUrl}${path}`;
    console.log("________________________________________________________________________");
    logger.info(`Forwarding request to ${url} with method ${method}`);
    
    logger.info(`Request headers:`, {
        ...headers,
        host: undefined,
        'content-length': undefined
    });
    
    console.log("sholay",body)
    
    console.log("________________________________________________________________________");
    

    const requestConfig : AxiosRequestConfig = {
        method: method,
        url,
        headers: {
            ...headers,
            host : undefined,
            'content-length' : undefined
        },

        validateStatus: () => true,
        maxRedirects: 5,
    }

    if(method !== 'GET' && method !== 'HEAD' && method !== 'DELETE' && body){ 
        requestConfig.data = body;
    }

     if ((method === 'GET' || method === 'DELETE') && body) {
          requestConfig.params = body;
     }

      logger.debug(`Forwarding ${method} ${url}`, {
               headers: requestConfig.headers,
               hasData: !!body,
               timeout: Config.SERVICE_TIMEOUT_MS,
          });

     try {
              const response = await circuitBreaker.execute(() => axios(requestConfig));
    
              logger.info(`Response from ${url}:`, {
                   status: response.status,
                   statusText: response.statusText,
              });
    
              return {
                   status: response.status,
                   data: response.data,
                   headers: response.headers,
              };
         } catch (err: unknown) {
    if (axios.isAxiosError(err)) {
        logger.error(`Error forwarding to ${serviceUrl}:`, {
            message: err.message,
            code: err.code,
            url,
            method,
            timeout: Config.SERVICE_TIMEOUT_MS,
        });

        if (
            err.code === "ECONNABORTED" ||
            err.code === "ETIMEDOUT"
        ) {
            throw createHttpError(
                408,
                `Request to ${serviceUrl} timed out after ${Config.SERVICE_TIMEOUT_MS}ms`
            );
        }

        if (err.code === "ECONNREFUSED") {
            throw createHttpError(
                503,
                `Cannot connect to ${serviceUrl}. Service may be down.`
            );
        }

        if (err.response) {
            logger.error(`Service error from ${serviceUrl}:`, {
                status: err.response.status,
                data: err.response.data,
            });

            return {
                status: err.response.status,
                data: err.response.data,
                headers: err.response.headers,
            };
        }

        throw createHttpError(
            503,
            `Service temporarily unavailable: ${err.message}`
        );
    }

    // Something other than Axios threw an error
    if (err instanceof Error) {
        throw createHttpError(500, err.message);
    }

    throw createHttpError(500, "Unknown error occurred");
}

}


export const createProxy = (serviceName: keyof typeof circuitBreakers, serviceUrl: string) => {
    
    const circuitBreaker = circuitBreakers[serviceName];

    if(!circuitBreaker){
        throw createHttpError(500, `Failed to create circuit breaker for ${serviceName}`);
    }

    return async (req : Request , res : Response , next: NextFunction) => {
        const reqPath = req.path;
        // /user/auth/login
        logger.info(`Forwarding request to ${serviceName} at paths: ${req.path}`);
        const pathParts = reqPath.split('/');
        logger.info(`Path parts: ${pathParts}`);
        const servicePath = '/' + pathParts.slice(1).join('/'); 
        logger.info(`Service paths: ${servicePath}`);
        console.log("************************************************************************");
        logger.info(`Request method: ${req.method}`);
        logger.info(`Request body: ${req.body}`);
        console.log("************************************************************************");

        const result = await forwardRequest(
            serviceUrl,
            servicePath + (req.url.includes('?') ? req.url.substring(req.url.indexOf('?')) : ''),
            req.method,
            req.body,
            req.headers,
            circuitBreaker
        );

        const excludeHeaders = ['connection', 'keep-alive', 'transfer-encoding', 'host'];
    
        console.log("Result headers : ", result.headers)

        Object.keys(result.headers).forEach((key)=>{
            if(!excludeHeaders.includes(key.toLowerCase())){
                res.setHeader(key, result.headers[key])
            }
        })

        
        res.status(result.status).json(result.data);


    }

}