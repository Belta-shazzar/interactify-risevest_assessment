import { PostController } from "@/controllers/post.controller";
import { Routes } from "@/interfaces/routes.interface";
import { Router } from "express";

export class PostRoute implements Routes {
  public path = "/posts";
  public router = Router();
  public postController = new PostController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
  }
}
