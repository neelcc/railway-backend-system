import { Config } from "./index";
import { Kafka, logLevel } from "kafkajs";


export const kafka = new Kafka({
     clientId: Config.KAFKA_CLIENT_ID,
     brokers: [Config.KAFKA_CLIENT_BROKER || 'localhost:9093'],
     logLevel: logLevel.ERROR,
     retry: {
          initialRetryTime: 300,
          retries: 10,
          maxRetryTime: 30000,
          multiplier: 2,
     },
});

export const consumer = kafka.consumer({
     groupId: 'notification-service-group',
     sessionTimeout: 30000,
     heartbeatInterval: 3000,
});

//  Producer (used only for DLQ publishing)
// const producer = kafka.producer({
//      allowAutoTopicCreation: true,
//      retry: { retries: 3 },
// });

// let isProducerConnected = false;

// const connectProducer = async () => {
//      if (!isProducerConnected) {
//           await producer.connect();
//           isProducerConnected = true;
//           logger.info('Kafka producer connected (DLQ)');
//      }
// };

// // Graceful shutdown
// const shutdown = async () => {
//      logger.info('Shutting down Kafka connections...');
//      await consumer.disconnect();
//      if (isProducerConnected) {
//           await producer.disconnect();
//           isProducerConnected = false;
//      }
//      process.exit(0);
// };

// process.on('SIGTERM', shutdown);
// process.on('SIGINT', shutdown);
