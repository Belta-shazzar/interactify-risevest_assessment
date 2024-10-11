import { CreatePostDto } from "@/dto/post.dto";
import { HttpException } from "@/exceptions/http.exception";
import { paginateResponse } from "@/utils/paginate";
import { Post, PrismaClient, User } from "@prisma/client";
import httpStatus from "http-status";

export class PostService {
  private post = new PrismaClient().post;

  public async createPost(
    postDto: CreatePostDto,
    author: Partial<User>
  ): Promise<Post> {
    const post = await this.post.create({
      data: { ...postDto, authorId: author.id },
    });

    return post;
  }

  public async getPostById(postId: string): Promise<Post> {
    const post = await this.post.findUnique({ where: { id: postId } });

    if (!post)
      throw new HttpException(httpStatus.NOT_FOUND, "Post does not exist");
    return post;
  }

  public async getPostsByAuthorId(
    authorId: string,
    page: number,
    limit: number
  ) {
    const skip = (page - 1) * limit;

    const posts = await this.post.findMany({
      skip: skip,
      take: limit,
      where: { authorId },
    });

    const count = await this.post.count();

    return paginateResponse([posts, count], page, limit);
  }
}
