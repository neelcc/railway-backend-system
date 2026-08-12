import { Config } from "../config"
import jwt from "jsonwebtoken"
import crypto from "crypto"

export const generateAccessToken = (userId : string ) => {
     const payload = {
          sub: userId
     }

     console.log("For signing " , Config.JWT_ACCESS_SECRET)
     console.log("For signing " , Config.JWT_ACCESS_SECRET)
     console.log("For signing " , Config.JWT_ACCESS_SECRET)
     console.log("For signing " , Config.JWT_ACCESS_SECRET)
     console.log("For signing " , Config.JWT_ACCESS_SECRET)

     return jwt.sign(payload, Config.JWT_ACCESS_SECRET , { expiresIn: Config.ACCESS_TOKEN_EXP  })
}

export const generateRefreshToken = (userId : string) => {
     const payload = {
          sub  : userId,
          jti: crypto.randomUUID()
     }  
     return jwt.sign(payload, Config.JWT_REFRESH_SECRET , { expiresIn: Config.REFRESH_TOKEN_EXP })
}

     export const verifyAccessToken = (accessToken : string ) => {
          return jwt.verify(accessToken, Config.JWT_ACCESS_SECRET);
     }

export const verifyRefreshToken = (refreshToken : string ) => {
     return jwt.verify(refreshToken, Config.JWT_REFRESH_SECRET);
}