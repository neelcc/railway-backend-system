import express from "express";
import  trainRouter  from "./routes/trainRouter";
import  scheduleRouter from "./routes/scheduleRouter";
import  stationRouter  from "./routes/stationRouter";
import { globalErrorHandler } from "@irctc/shared/src/middlewares/globalErrorHandler";
import { corsMiddleware } from "@irctc/shared/src/middlewares/cors";
export const app = express();

app.use(express.json());
app.use(corsMiddleware);
app.use("/admins/trains", trainRouter);
app.use("/admins/schedules", scheduleRouter);
app.use("/admins/stations", stationRouter);
app.use(globalErrorHandler);
app.get("/", (req, res) => {
    res.send("Welcome to the Admin Service API");
});

