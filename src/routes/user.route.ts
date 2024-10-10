import { UserController } from "@/controllers/user.controller";
import { Routes } from "@/interfaces/routes.interface";
import { Router } from "express";

export class UserRoute implements Routes {
  public path = "/users";
  public router = Router();
  public userController = new UserController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {}
}
