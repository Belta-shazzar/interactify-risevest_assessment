import { CommentController } from "@/controllers/comment.controller";
import { Routes } from "@/interfaces/routes.interface";
import { Router } from "express";

export class CommentRoute implements Routes {
  public path = "/comments";
  public router = Router();
  private commentController = new CommentController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
  }
}
