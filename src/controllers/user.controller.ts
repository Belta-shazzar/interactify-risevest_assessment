import { UserService } from "@/services/user.service";
import { Request, Response, NextFunction } from "express";

export class UserController {
  private userService = new UserService();

  public getUsers = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const page: number = Number(req.query.page) || 1;
      const limit: number = Number(req.query.limit) || 20;

      const response = await this.userService.getUsers(page, limit);

      res.status(201).json({ ...response });
    } catch (error) {
      next(error);
    }
  };
}
