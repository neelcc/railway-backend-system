import express from "express";
import  trainRouter  from "./routes/trainRouter";
import  scheduleRouter from "./routes/scheduleRouter";
import  stationRouter  from "./routes/stationRouter";
export const app = express();

app.use(express.json());

app.use("/trains", trainRouter);
app.use("/schedules", scheduleRouter);
app.use("/stations", stationRouter);

app.get("/", (req, res) => {
    res.send("Welcome to the Admin Service API");
});

