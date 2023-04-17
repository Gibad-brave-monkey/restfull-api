"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const http_1 = __importDefault(require("http"));
const mongoose_1 = __importDefault(require("mongoose"));
const dotenv_1 = __importDefault(require("dotenv"));
const config_1 = require("./config/config");
const Logging_1 = __importDefault(require("./library/Logging"));
const Author_router_1 = __importDefault(require("./routes/Author.router"));
const Book_router_1 = __importDefault(require("./routes/Book.router"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const url = config_1.config.mongo.url;
// Connect to Mongo
mongoose_1.default
    .connect(url)
    .then(() => {
    Logging_1.default.info("Connected to mongoDB");
    StartServer();
})
    .catch((err) => {
    Logging_1.default.error("Unable to connect: ");
    Logging_1.default.error(err);
});
// Only start the server if Mongo Connect
const StartServer = () => {
    app.use((req, res, next) => {
        // Log the Request
        Logging_1.default.info(`Incoming => Method: [${req.method}] - Url: [${req.url}] - IP: [${req.socket.remoteAddress}]`);
        res.on("finish", () => {
            // Log the Response
            Logging_1.default.info(`Incoming => Method: [${req.method}] - Url: [${req.url}] - IP: [${req.socket.remoteAddress}] - Status [${res.statusCode}]`);
        });
        next();
    });
    app.use(express_1.default.urlencoded({ extended: true }));
    app.use(express_1.default.json());
    // Rules of API
    app.use((req, res, next) => {
        res.header("Access-Control-Allow-Origin", "*");
        res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
        if (req.method === "OPTIONS") {
            res.header("Access-Control-Allow-Methods", "PUT,POST, PATCH, DELETE, GET");
            return res.status(200).json({});
        }
        next();
    });
    // Routes
    app.use("/authors", Author_router_1.default);
    app.use("/books", Book_router_1.default);
    // Healthcheck
    app.get("/ping", (req, res, next) => {
        res.status(200).json({ message: "pong" });
    });
    // Error handling
    app.use((req, res, next) => {
        const error = new Error("not found");
        Logging_1.default.error(error);
        return res.status(404).json({ message: error.message });
    });
    http_1.default
        .createServer(app)
        .listen(config_1.config.server.port, () => Logging_1.default.info(`Server is running on port ${config_1.config.server.port}`));
};
