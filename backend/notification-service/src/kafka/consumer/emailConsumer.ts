import { consumer, } from "../../config/kafka";
import { KAFKA_TOPICS, KafkaTopics } from "@irctc/shared/src/constants/kafka-topic"
import logger from "../../config/logger";
import { emailService } from "../../services/emailService";
import { EmailData } from "../../config/types";

 class EmailConsumer {

    async start(){
        try {
            await consumer.connect();
            await consumer.subscribe(
            {
                topics : Object.values(KAFKA_TOPICS),
                fromBeginning : false
            }
        )



        await consumer.run({
            eachMessage : async ({ topic  , partition, message }) => {
                const data = JSON.parse(
                message.value?.toString() ?? "{}"
                  ) as EmailData;

                  console.log(data)
  
                 await this.handleMessage(topic as KafkaTopics  , data  );
            }
        })  
        } catch (error) {
            throw error  
        }
    }

    
     async handleMessage(topic : KafkaTopics , data : EmailData ) {
          switch (topic) {
               case KAFKA_TOPICS.OTP_EMAIL:
                    await this.handleOtpEmail(data);
                    break;

               case KAFKA_TOPICS.WELCOME_EMAIL:
                    await this.handleWelcomeEmail(data);
                    break;

            //    case KAFKA_TOPICS.BOOKING_CONFIRMED:
            //         await this.handleBookingConfirmed(data);
            //         break;

            //    case KAFKA_TOPICS.BOOKING_FAILED:
            //         await this.handleBookingFailed(data);
            //         break;

            //    case KAFKA_TOPICS.BOOKING_CANCELLED:
            //         await this.handleBookingCancelled(data);
            //         break;

               default:
                    console.log(`Unknown topic: ${topic}`);
          }
     }

      async handleOtpEmail(data : EmailData ) {
          const { email, otp, ttlMinutes } = data;

          if (!email || !otp) {
               throw new Error('Missing required fields: email or otp');
          }

          await emailService.sendOtpEmail(email, otp, ttlMinutes || 5);
          logger.info(`OTP email sent to ${email}`);
     }

     async handleWelcomeEmail(data : EmailData ) {
          const { email, firstName } = data;

          if (!email || !firstName) {
               throw new Error('Missing required fields: email or firstName');
          }

          await emailService.sendWelcomeEmail(email, firstName);
          logger.info(`Welcome email sent to ${email}`);
     }

}

export const emailConsumer = new EmailConsumer();