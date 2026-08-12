import { Message, ProducerRecord, RecordMetadata } from "kafkajs";
import { producer } from "../../config/kafka";
import logger from "../../config/logger";
import { KAFKA_TOPICS } from '@irctc/shared/src/constants/kafka-topic';

class NotificationProducer {

    isInitialized : boolean

    constructor(){
        this.isInitialized = false;
    }

    async intialized() {
        if(!this.isInitialized){
            await producer.connect()
            this.isInitialized = true;
        }
    }


    async sendMessage(key : string ,topic : string ,value : object ) {
        try {
            await this.intialized();

        const producerMessage : Message  = 
            {
                key : key || `${topic}-${Date.now()}`,
                value : JSON.stringify(value),
                timestamp : Date.now().toString()
            }
        
        console.log("producerMessage",producerMessage)
   
        const message : ProducerRecord  = {
            topic,
            messages : [
                producerMessage
            ],
        }

        console.log("message",message)


        const result : RecordMetadata[] = await producer.send(message)

        logger.info(`Message sent to kafka topic: ${topic}`, {
                    key,
                    partition: result[0]?.partition,
                    offset: result[0]?.offset,
               });

        return result
        } catch (error) {
             logger.error(`Failed to send message to kafka topic: ${topic}`, {
                    error,
                    key
               })
               throw error;
        }

    }

    async sendOtpEmail(email : string , otp : string , ttlMinutes = 5){

        console.log("Sendotpemail", email,otp)

          return this.sendMessage(
              `otp-${email}`,
              KAFKA_TOPICS.OTP_EMAIL,
               {email, otp, ttlMinutes}
          )
     }

     async sendWelcomeEmail(email : string , firstName : string ){
          return this.sendMessage(
              `welcome-${email}`,
              KAFKA_TOPICS.WELCOME_EMAIL,
               {email, firstName}
          )
     }


}

export const notificationProducer = new NotificationProducer();