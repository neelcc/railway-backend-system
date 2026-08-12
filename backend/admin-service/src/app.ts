import express from "express";
export const app = express();

app.use(express.json());

app.use("/admin", trainRouter);
app.use("/schedules", scheduleRouter);
app.use("/stations", stationRouter);

app.get("/", (req, res) => {
    res.send("Welcome to the Admin Service API");
});

