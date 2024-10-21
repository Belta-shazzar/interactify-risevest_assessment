import { Routes } from "@/interfaces/routes.interface";
import { Request, Response, NextFunction, Router } from "express";

export class AppRoute implements Routes {
  path: string = "/";
  router: Router = Router();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get(this.path, this.baseURL);
    this.router.get(`${this.path}health`, this.health);
  }

  private baseURL = (req: Request, res: Response, next: NextFunction) => {
    res.json({ message: "Welcome to Interactify" });
  }

  private health = (req: Request, res: Response, next: NextFunction) => {
    res.status(200).json({
      status: "OK",
      uptime: process.uptime(),
      timestamp: new Date(),
      message: "Healthy",
    });
  }
}
