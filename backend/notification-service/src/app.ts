import express from "express"
import  { globalErrorHandler } from "@irctc/shared/src/middlewares/globalErrorHandler"

export const app = express();
app.use(globalErrorHandler);