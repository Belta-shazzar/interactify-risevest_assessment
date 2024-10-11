import { CreateCommentDto } from "@/dto/comment.dto";
import { Comment, Post, PrismaClient, User } from "@prisma/client";
import { PostService } from "./post.service";

export class CommentService {
  private comment = new PrismaClient().comment;
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
