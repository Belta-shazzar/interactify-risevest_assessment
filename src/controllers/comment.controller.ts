import { CreateCommentDto } from "@/dto/comment.dto";
import { RequestWithUser } from "@/interfaces/auth.middleware";
import { CommentService } from "@/services/comment.service";
import { User } from "@prisma/client";
import { Response, NextFunction } from "express";
import httpStatus from "http-status";

export class CommentController {
  private commentService = new CommentService();

  public createComment = async (
    req: RequestWithUser,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const commentData: CreateCommentDto = req.body;
      const postId: string = req.params.postId;
      const user: Partial<User> = req.user;

      const response = await this.commentService.createComment(
        commentData,
        user,
        postId
      );
      res.status(httpStatus.CREATED).json({ ...response });
    } catch (error) {
      next(error);
    }
  };
}
