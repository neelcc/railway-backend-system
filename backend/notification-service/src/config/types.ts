import { KafkaMessage } from "kafkajs";

export interface EmailData  {
    email? : string;
    otp? : string;
    firstName? : string;
    ttlMinutes? : number;

}

export interface EmailMessage {
    to : string;
    from : string;
    subject : string;
    html : string
}