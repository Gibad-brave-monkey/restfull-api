import express, { Request, Response, NextFunction } from "express";
import http from "http";
import mongoose from "mongoose";
import dotenv from "dotenv";
import { config } from "./config/config";
import Logging from "./library/Logging";
import authorRoutes from "./routes/Author.router";
import bookRoutes from "./routes/Book.router";

dotenv.config();

const app = express();

const url = config.mongo.url;

// Connect to Mongo
mongoose
  .connect(url)
  .then(() => {
    Logging.info("Connected to mongoDB");
    StartServer();
  })

  .catch((err) => {
    Logging.error("Unable to connect: ");
    Logging.error(err);
  });

// Only start the server if Mongo Connect
const StartServer = () => {
  app.use((req: Request, res: Response, next: NextFunction) => {
    // Log the Request
    Logging.info(
      `Incoming => Method: [${req.method}] - Url: [${req.url}] - IP: [${req.socket.remoteAddress}]`
    );

    res.on("finish", () => {
      // Log the Response
      Logging.info(
        `Incoming => Method: [${req.method}] - Url: [${req.url}] - IP: [${req.socket.remoteAddress}] - Status [${res.statusCode}]`
      );
    });

    next();
  });

  app.use(express.urlencoded({ extended: true }));
  app.use(express.json());

  // Rules of API
  app.use((req: Request, res: Response, next: NextFunction) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header(
      "Access-Control-Allow-Headers",
      "Origin, X-Requested-With, Content-Type, Accept, Authorization"
    );

    if (req.method === "OPTIONS") {
      res.header(
        "Access-Control-Allow-Methods",
        "PUT,POST, PATCH, DELETE, GET"
      );
      return res.status(200).json({});
    }

    next();
  });

  // Routes

  app.use("/authors", authorRoutes);
  app.use("/books", bookRoutes);

  // Healthcheck
  app.get("/ping", (req: Request, res: Response, next: NextFunction) => {
    res.status(200).json({ message: "pong" });
  });

  // Error handling
  app.use((req: Request, res: Response, next: NextFunction) => {
    const error = new Error("not found");
    Logging.error(error);

    return res.status(404).json({ message: error.message });
  });

  http
    .createServer(app)
    .listen(config.server.port, () =>
      Logging.info(`Server is running on port ${config.server.port}`)
    );
};
