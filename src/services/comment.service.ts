import { CreateCommentDto } from "@/dto/comment.dto";
import { Comment, Post, User } from "@prisma/client";
import { PostService } from "@/services/post.service";
import prisma from "@/config/prisma";

export class CommentService {
  private comment = prisma.comment;
  private post = new PostService();

  public async createComment(
    commentDto: CreateCommentDto,
    user: Partial<User>,
    postId: string
  ): Promise<Comment> {
    const post: Post = await this.post.getPostById(postId);

    const comment = await this.comment.create({
      data: { ...commentDto, userId: user.id, postId: post.id },
    });

    return comment;
  }
}
