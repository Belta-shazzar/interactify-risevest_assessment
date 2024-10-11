import { LoginDto, SignUpDto } from "@/dto/auth.dto";
import { AuthData, RequestWithUser } from "@/interfaces/auth.middleware";
import { AuthService } from "@/services/auth.service";
import { logger } from "@/utils/logger";
import { Request, Response, NextFunction } from "express";

export class AuthController {
  private authService = new AuthService();

  public signup = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userData: SignUpDto = req.body;
      const response: AuthData = await this.authService.signUp(userData);

      res.status(201).json({ ...response });
    } catch (error) {
      logger.error(error);
      next(error);
    }
  };

  public login = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userData: LoginDto = req.body;
      const response = await this.authService.login(userData);

      res.status(200).json({ ...response });
    } catch (error) {
      next(error);
    }
  };

  public getAuthenticatedUser = async (
    req: RequestWithUser,
    res: Response,
    next: NextFunction
  ) => {
    res.status(200).json({ user: req.user });
  };
}
