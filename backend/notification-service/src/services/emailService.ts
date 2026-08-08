import sgMail from "@sendgrid/mail";
import { Config } from "../config";
import logger from "../config/logger";
import { getOtpTemplate, getWelcomeTemplate } from "../templates";
import { EmailMessage } from "../config/types";

sgMail.setApiKey(Config.SENDGRID_API_KEY);

class EmailService {
    maxRetries : number;
    OWNER_MAIL : string

    constructor() {
          this.OWNER_MAIL = Config.SENDGRID_FROM_EMAIL
          this.maxRetries = 3;
     }

 
      async sendWithRetry(msg : EmailMessage , retries = 0) : Promise<{success : true}> {
          try {
               await sgMail.send(msg);
               logger.info(`Email sent successfully to ${msg.to}`, {
                    subject: msg.subject,
                    attempt: retries + 1
               });
               return { success: true };
          } catch (error) {
               logger.error(`Email sending failed (attempt ${retries + 1}/${this.maxRetries})`, {
                    to: msg.to,
                    error: error,
                    // code: error.code,
               });

               if (retries < this.maxRetries - 1) {
                    const delay = Math.pow(2, retries) * 1000;
                    await new Promise(resolve => setTimeout(resolve, delay));
                    return this.sendWithRetry(msg, retries + 1);
               }

               throw error;
          }
     }

     async sendOtpEmail(email : string , otp : string , ttlMinutes : number) {
          // const msg : EmailMessage  = {
          //      to: email,
          //      from: this.OWNER_MAIL,
          //      subject: 'Your DesignKarle verification code',
          //      html: getOtpTemplate(otp, ttlMinutes),
          // };

          logger.info("Email sent")

          // return this.sendWithRetry(msg);
     }

     async sendWelcomeEmail(email : string , firstName : string) {
          const msg : EmailMessage = {
               to: email,
               from: this.OWNER_MAIL,
               subject: 'Welcome to DesignKarle - Email Verified',
               html: getWelcomeTemplate(firstName),
          };

          return this.sendWithRetry(msg);
     }

}

export const emailService = new EmailService();





