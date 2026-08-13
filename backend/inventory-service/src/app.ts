import express from "express";
import { globalErrorHandler } from "@irctc/shared/src/middlewares/globalErrorHandler";
import { corsMiddleware } from "@irctc/shared/src/middlewares/cors";
export const app = express();

app.use(express.json());
app.use(corsMiddleware);

app.get("/", (req, res) => {
    res.send("Welcome to the Admin Service API");
});


app.use(globalErrorHandler);