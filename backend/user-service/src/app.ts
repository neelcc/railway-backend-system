import express from 'express';
import { globalErrorHandler } from '@irctc/shared/src/middlewares/globalErrorHandler';
import { corsMiddleware } from './middlewares/cors';
import authRouter from './routes/authRouter';
import userRouter from './routes/userRouter';
import { redis } from './config/redis';
import cookieParser from "cookie-parser";


export const app = express();
app.use(express.json());
app.use(corsMiddleware)
app.use(cookieParser());    
app.use("/auth", authRouter);
app.use("/user", userRouter);
app.use(globalErrorHandler);

app.get("/", (req, res) => {
    res.send("Server is working");
});

// app.post("/redis", async (req, res) => {
//     await redis.set("test", "Hello World");
//     res.status(200).send("Value set in Redis");
// })

// app.get("/redis", async (req, res) => {
//     const value = await redis.get("test");
//     res.status(200).send(value);
// })

// app.get("/redis/exists", async (req, res) => {
//     const exists = await redis.exists("test");
//     res.status(200).send({ exists });
// })