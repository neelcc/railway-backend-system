import express from "express";
import  trainRouter  from "./routes/trainRouter";
import  scheduleRouter from "./routes/scheduleRouter";
import  stationRouter  from "./routes/stationRouter";
export const app = express();

app.use(express.json());

app.use("/admins/trains", trainRouter);
app.use("/admins/schedules", scheduleRouter);
app.use("/admins/stations", stationRouter);

app.get("/", (req, res) => {
    res.send("Welcome to the Admin Service API");
});

