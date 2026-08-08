import sgMail from "@sendgrid/mail";
import { Config } from "../config";
import logger from "../config/logger";

sgMail.setApiKey(Config.SENDGRID_API_KEY);

export const sendOtpEmail = async (email: string, otp: string) => {


     const msg = {
            to: email,
            from: Config.SENDGRID_FROM_EMAIL, // verified sender
            subject: "Verify Your Email",
            text: `Your verification code is ${otp}. It expires in 10 minutes.`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto;">
                    <h2>Email Verification</h2>

                    <p>Hello,</p>

                    <p>Your One-Time Password (OTP) for email verification is:</p>

                    <div style="
                        font-size: 32px;
                        font-weight: bold;
                        letter-spacing: 6px;
                        background: #f5f5f5;
                        padding: 16px;
                        text-align: center;
                        border-radius: 8px;
                        margin: 20px 0;
                    ">
                        ${otp}
                    </div>

                    <p>This OTP is valid for <strong>10 minutes</strong>.</p>

                    <p>If you didn't request this email, you can safely ignore it.</p>

                    <hr />

                    <small>
                        This is an automated email. Please do not reply.
                    </small>
                </div>
            `,
        };

        try {
            await sgMail.send(msg);
            logger.info(`OTP email sent to ${email}`);
        } catch (error) {
            logger.info("Failed to send OTP email", error);
            throw error;
        }
}


