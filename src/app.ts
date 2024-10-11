import "reflect-metadata";
import express from "express";
import { Routes } from "@/interfaces/routes.interface";
import config from "@/config";
import morgan from "morgan";
import hpp from "hpp";
import helmet from "helmet";
import cors from "cors";
import rateLimit from "express-rate-limit";
import { logger, stream } from "@/utils/logger";
import { ErrorMiddleware } from "@/middlewares/error.middleware";
import { HttpException } from "@/exceptions/http.exception";
import httpStatus from "http-status";

export class App {
  public app: express.Application;
  public env: string;
  public port: string | number;

  constructor(routes: Routes[]) {
    this.app = express();
    this.env = config.app.node_env;
    this.port = config.app.port;

    this.initializeMiddleware();
    // this.initializeResponseTransform()
    this.initializeRoutes(routes);
    this.initializeErrorHandling();
  }

  public listen() {
    this.app.listen(this.port, () => {
      logger.info(`======= ENV: ${this.env} ========`);
      logger.info(`🚀 App listening on the port ${this.port}`);
    });
  }

  public getServer() {
    return this.app;
  }

  private initializeMiddleware() {
    this.app.use(morgan(config.logs.format, { stream }));
    this.app.use(
      cors({ origin: config.cors.origin, credentials: config.cors.credentials })
    );
    this.app.use(hpp());
    this.app.use(helmet());
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));
    this.app.use(
      rateLimit({
        windowMs: 15 * 60 * 1000,
        max: 100,
        standardHeaders: true,
        legacyHeaders: false,
        handler: (req, res, next) => {
          next(
            new HttpException(
              httpStatus.TOO_MANY_REQUESTS,
              `Rate limit exceeded for IP: ${req.ip}`
            )
          );
        },
      })
    );
  }

  private initializeRoutes(routes: Routes[]) {
    routes.forEach((route) => {
      this.app.use("/", route.router);
    });
  }

  // private initializeResponseTransform() {
  //   this.app.use(transformResponse);
  // }

  private initializeErrorHandling() {
    this.app.use(ErrorMiddleware);
  }
}
