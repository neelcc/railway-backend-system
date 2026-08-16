import { Request, Response, NextFunction, CookieOptions } from 'express';
import { AuthService } from '../services/authService';
import { Logger } from 'winston';
import { Config } from '../config';
import { getDeviceFingerprint } from '../utils/getDeviceFingerprint';
import createHttpError from 'http-errors';

const isProd = Config.NODE_ENV === 'production';

const cookieOptions = (maxAge: number): CookieOptions => ({
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? 'strict' : 'lax',
    maxAge,
});


export class AuthController {

    constructor(private authService: AuthService, private logger: Logger) {

    }

    sendOtp = async (req: Request, res: Response, next: NextFunction) => {

        const { firstName, lastName, email, password, confirmPassword } = req.body;

        this.logger.info('Recieved request to send OTP for user signup', { email, firstName, lastName });

        if (!firstName || !lastName || !email || !password || !confirmPassword) {
            this.logger.error('Missing required fields for signup');
            const error = createHttpError(400, 'Missings required fields for signup');
            next(error);
            return;
        }

        if (password !== confirmPassword) {
            this.logger.error('Password and confirm password do not match');
            const error = createHttpError(400, 'Password and confirm password do not match');
            next(error);
            return;
        }

        const { otpSessionId, otp } = await this.authService.sendOtp({ firstName, lastName, email, password });

        res.cookie("otp_session", otpSessionId, cookieOptions(Config.OTP_TTL * 1000)).status(200).json({
            success: true,
            message: "OTP sent successfully",
            otp: otp,
            otpSessionId: otpSessionId
        })


    }

    verifyOtp = async (req: Request, res: Response, next: NextFunction) => {
        const { otp } = req.body;
        const otpSessionId = req.cookies.otp_session;

        if (!otp || !otpSessionId) {
            this.logger.error('Missing OTP or OTP session ID');
            const error = createHttpError(400, 'Missing OTP or OTP session ID');
            next(error);
            return;
        }
        const user = await this.authService.verifyOtp(otp, otpSessionId);
        res.clearCookie("otp_session");
        return res.status(201).json({
            success: true,
            message: "User Account created successfully",
            data: user
        })

    }

    login = async (req: Request, res: Response, next: NextFunction) => {

        const { email, password } = req.body;

        this.logger.info("Login controller called with email: " + email);
        
        const deviceId = getDeviceFingerprint(req)

        const { accessToken, refreshToken, loggedInUser } = await this.authService.login(email, password, deviceId);

        res.cookie("accessToken", accessToken, cookieOptions(Config.ACCESS_TOKEN_EXP_SEC * 1000))
        res.cookie("refreshToken", refreshToken, cookieOptions(Config.REFRESH_TOKEN_EXP_SEC * 1000))
            .status(200).json({
                success: true,
                message: "Logged in successfully",
                loggedInUser
            })

    }

    rotateRefreshToken = async (req: Request, res: Response, next: NextFunction) => {

        const refreshToken = req.cookies.refreshToken;

        if (!refreshToken) {
            const error = createHttpError(400, "Refresh token is missing");
            next(error);
            return;
        }
        const deviceId = getDeviceFingerprint(req);
        const { newAccessToken, newRefreshToken } = await this.authService.rotateRefreshToken(refreshToken, deviceId);
        res.cookie("accessToken", newAccessToken, cookieOptions(Config.ACCESS_TOKEN_EXP_SEC * 1000))
        res.cookie("refreshToken", newRefreshToken, cookieOptions(Config.REFRESH_TOKEN_EXP_SEC * 1000))
            .status(200).json({
                success: true,
                message: "Access and Refresh token reissued"
            })


    }

}