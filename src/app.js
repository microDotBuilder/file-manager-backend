import dotenv from "dotenv";
import cors from "cors";
import express from "express";
import { DriveInit } from "./config/init.js";
dotenv.config({
  path: "./.env",
});

const app = express();

DriveInit();
// global middlewares
app.use(
  cors({
    origin: "*",
    credentials: true,
  })
);
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
// api routes
import healthcheckRouter from "./routes/healthcheck.routes.js";
import { errorHandler } from "./middlewares/error.middlewares.js";
import uploadRouter from "./routes/upload.route.js";

app.use("/api/v1/healthcheck", healthcheckRouter);
app.use("/api/v1/upload", uploadRouter);

// common error handling middleware
app.use(errorHandler);

export { app };
