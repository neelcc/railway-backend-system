import { RecordMetadata } from "kafkajs";
import { connectProducer, producer } from "../../config/kafka";
import logger from "../../config/logger";
import { KAFKA_TOPICS } from '@irctc/shared/src/constants/kafka-topic';
import { Train } from "@irctc/shared/src/types/train";
import { Station } from "@irctc/shared/src/types/station";
import { RouteCreatedEvent, ScheduleEvent } from "@irctc/shared/src/types/event";
import { Schedule } from "@irctc/shared/src/types/schedule";

 class AdminProducer {

    isInitialized: boolean;

    constructor() {
        this.isInitialized = false;
    }

    async initialize() {
        if (!this.isInitialized) {
            await connectProducer();
            this.isInitialized = true;
        }
    }

    async sendMessage(topic: string, key: string, value: object): Promise<RecordMetadata[]> {

        try {

            await this.initialize();
            const result: RecordMetadata[] = await producer.send({
                topic: topic,
                messages: [
                    {
                        key: key,
                        value: JSON.stringify(value),
                        timestamp: Date.now().toString()
                    }
                ]
            });


            logger.info(`Message sent to topic: ${topic}`, {
                key,
                partition: result[0]?.partition,
                offset: result[0]?.offset,
            });
            return result;

        } catch (error) {
            logger.error(`Error sending message to topic: ${topic}`, { error });
            throw error;
        }

    }


    async publishStationCreated(station : Station) {
          return this.sendMessage(
               KAFKA_TOPICS.STATION_CREATED,
               `station-${station.id}`,
               { eventType: 'STATION_CREATED', data: station, timestamp: new Date().toISOString() }
          );
     }

     async publishTrainCreated(train: Train ) {
        return this.sendMessage(
            KAFKA_TOPICS.TRAIN_CREATED,
            `train-${train.id}`,
            { eventType: 'TRAIN_CREATED', data: train, timestamp: new Date().toISOString() }
        );
    }

    async publishRouteCreated(routeData : RouteCreatedEvent) {
          return this.sendMessage(
               KAFKA_TOPICS.ROUTE_CREATED,
               `route-${routeData.id}`,
               routeData
          );
     }

    async publishScheduleCreated(scheduleData : ScheduleEvent) {
          return this.sendMessage(
               KAFKA_TOPICS.SCHEDULE_CREATED,
               `schedule-${scheduleData.scheduleId}`,
               scheduleData
          );
     }

    async publishScheduleCancelled(schedule : Schedule ) {
          return this.sendMessage(
               KAFKA_TOPICS.SCHEDULE_CANCELLED,
               `schedule-${schedule.id}`,
               { eventType: 'SCHEDULE_CANCELLED', data: schedule, timestamp: new Date().toISOString() }
          );
     }
     

}


const adminProducer = new AdminProducer();

export { adminProducer };