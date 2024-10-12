import { PostController } from "@/controllers/post.controller";
import { CreatePostDto } from "@/dto/post.dto";
import { Routes } from "@/interfaces/routes.interface";
import { AuthMiddleware } from "@/middlewares/auth.middleware";
import { InputValidationMiddleware } from "@/middlewares/validation.middleware";
import { Router } from "express";

export class PostRoute implements Routes {
  public path = "/posts";
  public router = Router();
  private postController = new PostController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post(
      `${this.path}`,
      AuthMiddleware,
      InputValidationMiddleware(CreatePostDto),
      this.postController.createPost
    );

    this.router.get(`${this.path}/:postId`, this.postController.getAPost);

    this.router.get(
      `${this.path}/:authorId/author`,
      this.postController.getAnAuthorPosts
    );
  }
}
