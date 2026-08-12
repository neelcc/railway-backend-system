import express from "express";
import cookieParser from "cookie-parser";
import { corsMiddleware } from "@irctc/shared/src/middlewares/cors";
import { globalErrorHandler } from '@irctc/shared/src/middlewares/globalErrorHandler';

export const app = express();

app.use(express.json());
app.use(corsMiddleware);
app.use(globalErrorHandler);
app.use(cookieParser());


app.get("/", (req, res) => {
    res.send("Server is working");
});
