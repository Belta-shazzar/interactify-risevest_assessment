import { Request, Response, NextFunction } from "express";

export class AuthController {
  public signup(req: Request, res: Response, next: NextFunction) {
    try {
      // const findAllUsersData: User[] = await this.user.findAllUser();

      res.status(200).json({ data: "", message: "create user" });
    } catch (error) {
      next(error);
    }
  }
}
