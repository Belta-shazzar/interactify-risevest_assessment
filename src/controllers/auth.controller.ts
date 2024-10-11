import { LoginDto, SignUpDto } from "@/dto/auth.dto";
import { AuthData, RequestWithUser } from "@/interfaces/auth.middleware";
import { AuthService } from "@/services/auth.service";
import { logger } from "@/utils/logger";
import { Request, Response, NextFunction } from "express";
import httpStatus from "http-status";

export class AuthController {
  private authService = new AuthService();

  public signup = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userData: SignUpDto = req.body;
      const response: AuthData = await this.authService.signUp(userData);

      res.status(httpStatus.CREATED).json({ ...response });
    } catch (error) {
      next(error);
    }
  };

  public login = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userData: LoginDto = req.body;
      const response = await this.authService.login(userData);

      res.status(httpStatus.OK).json({ ...response });
    } catch (error) {
      next(error);
    }
  };

  public getAuthenticatedUser = async (
    req: RequestWithUser,
    res: Response,
    next: NextFunction
  ) => {
    res.status(httpStatus.OK).json({ user: req.user });
  };
}
