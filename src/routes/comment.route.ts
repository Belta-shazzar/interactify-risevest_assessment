import { CommentController } from "@/controllers/comment.controller";
import { CreateCommentDto } from "@/dto/comment.dto";
import { Routes } from "@/interfaces/routes.interface";
import { AuthMiddleware } from "@/middlewares/auth.middleware";
import { InputValidationMiddleware } from "@/middlewares/validation.middleware";
import { Router } from "express";

export class CommentRoute implements Routes {
  public path = "/comments";
  public router = Router();
  private commentController = new CommentController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post(
      `${this.path}/:postId`,
      AuthMiddleware,
      InputValidationMiddleware(CreateCommentDto),
      this.commentController.createComment
    );
  }
}
