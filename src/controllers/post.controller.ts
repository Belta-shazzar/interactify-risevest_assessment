import { CreatePostDto } from "@/dto/post.dto";
import { RequestWithUser } from "@/interfaces/auth.middleware";
import { PostService } from "@/services/post.service";
import { User } from "@prisma/client";
import { Request, Response, NextFunction } from "express";
import httpStatus from "http-status";

export class PostController {
  private postService = new PostService();

  public createPost = async (
    req: RequestWithUser,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const postData: CreatePostDto = req.body;
      const user: Partial<User> = req.user;

      const response = await this.postService.createPost(postData, user);
      res.status(httpStatus.CREATED).json({ ...response });
    } catch (error) {
      next(error);
    }
  };

  public getAPost = async (
    req: RequestWithUser,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const postId: string = req.params.postId;

      const response = await this.postService.getPostById(postId);
      res.status(httpStatus.OK).json({ ...response });
    } catch (error) {
      next(error);
    }
  };

  public getAnAuthorPosts = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const page: number = Number(req.query.page) || 1;
      const limit: number = Number(req.query.limit) || 20;
      const authorId: string = req.params.authorId;

      const response = await this.postService.getPostsByAuthorId(
        authorId,
        page,
        limit
      );

      res.status(httpStatus.OK).json({ ...response });
    } catch (error) {
      next(error);
    }
  };
}
