import { Kafka, logLevel } from "kafkajs";
import { Config } from ".";
import logger from "./logger";

export const kafka : Kafka  = new Kafka(
    {
        clientId : Config.KAFKA_CLIENT_ID,
        brokers : [Config.KAFKA_CLIENT_BROKER || 'localhost:9093' ],
        logLevel : logLevel.ERROR,
        retry : {
            initialRetryTime : 300,
            retries : 8,
            maxRetryTime : 30000,
        },

    }
)

export const producer = kafka.producer({
    allowAutoTopicCreation : true,
    transactionTimeout : 30000,
    idempotent : true , // ensures exact on delivery
    maxInFlightRequests : 5,
    retry : {
        retries : 5
    }
})

let isConnected = false;


export const connectProducer = async () => {
     if (!isConnected) {
          await producer.connect();
          isConnected = true;
          logger.info('Kafka producer connected');
     }
};

export const disconnectProducer = async () => {
     if (isConnected) {
          await producer.disconnect();
          isConnected = false;
          logger.info('Kafka producer disconnected');
     }
};


