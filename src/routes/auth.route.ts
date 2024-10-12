import { AuthController } from "@/controllers/auth.controller";
import { LoginDto, SignUpDto } from "@/dto/auth.dto";
import { Routes } from "@/interfaces/routes.interface";
import { AuthMiddleware } from "@/middlewares/auth.middleware";
import { InputValidationMiddleware } from "@/middlewares/validation.middleware";
import { Router } from "express";

export class AuthRoute implements Routes {
  public path = "/auth";
  public router = Router();
  private authController = new AuthController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post(
      `${this.path}/sign-up`,
      InputValidationMiddleware(SignUpDto),
      this.authController.signup
    );

    this.router.post(
      `${this.path}/login`,
      InputValidationMiddleware(LoginDto),
      this.authController.login
    );
    
    this.router.get(
      `${this.path}/authenticated`,
      AuthMiddleware,
      this.authController.getAuthenticatedUser
    );
  }
}
