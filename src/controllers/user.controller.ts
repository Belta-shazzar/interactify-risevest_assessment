import { UserService } from "@/services/user.service";
import { Request, Response, NextFunction } from "express";
import httpStatus from "http-status";

export class UserController {
  private userService = new UserService();

  public getUsers = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const page: number = Number(req.query.page) || 1;
      const limit: number = Number(req.query.limit) || 20;

      const response = await this.userService.getUsers(page, limit);

      res.status(httpStatus.OK).json({ ...response });
    } catch (error) {
      next(error);
    }
  };

  public getTopThreeAuthorsByPostCount = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const response = await this.userService.getTopThreeAuthorsByPostCount();
      console.log("Without latest comment: ", response);

      res.status(httpStatus.OK).json({ ...response });
    } catch (error) {
      next(error);
    }
  };

  public getTopThreeAuthorsByPostCountWithTheirLatestComment = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const response =
        await this.userService.getTopThreeAuthorsByPostCountWithTheirLatestComment();

        console.log("With latest comment: ", response);
      res.status(httpStatus.OK).json({ ...response });
    } catch (error) {
      next(error);
    }
  };
}
