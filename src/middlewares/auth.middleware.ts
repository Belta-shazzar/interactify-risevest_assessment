import { NextFunction, Response } from "express";
import { verify } from "jsonwebtoken";
import { HttpException } from "@/exceptions/http.exception";
import {
  DataStoredInToken,
  RequestWithUser,
} from "@/interfaces/auth.middleware";
import config from "@/config";
import { UserService } from "@/services/user.service";

const userService = new UserService();

export const AuthMiddleware = async (
  req: RequestWithUser,
  res: Response,
  next: NextFunction
) => {
  try {
    const header = req.header("Authorization");
    const Authorization = header.split("Bearer ")[1];

    if (Authorization) {
      const { id } = verify(
        Authorization,
        config.app.jwtSecret
      ) as DataStoredInToken;

      const user = await userService.getUserById(id);

      req.user = userService.stripUserPassword(user);
      next();
    } else {
      next(new HttpException(404, "Authentication token missing"));
    }
  } catch (error) {
    next(new HttpException(401, "Wrong authentication token"));
  }
};
