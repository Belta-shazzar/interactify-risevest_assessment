import { SignUpDto } from "@/dto/auth.dto";
import { HttpException } from "@/exceptions/http.exception";
import { paginateResponse } from "@/utils/paginate";
import { PrismaClient, User } from "@prisma/client";
import httpStatus from "http-status";

export class UserService {
  private prisma = new PrismaClient();
  private user = this.prisma.user;

  public async createUser(signUpDto: SignUpDto): Promise<User> {
    const user = await this.user.create({
      data: signUpDto,
    });

    return user;
  }

  public async getUserByEmail(email: string): Promise<User> {
    return this.user.findUnique({ where: { email: email } });
  }

  public async getUserById(userId: string): Promise<User> {
    const user = await this.user.findUnique({ where: { id: userId } });

    if (!user)
      throw new HttpException(httpStatus.NOT_FOUND, "User does not exist");
    return user;
  }

  public async getUsers(page: number, limit: number) {
    const skip = (page - 1) * limit;

    const users = await this.user.findMany({
      skip: skip,
      take: limit,
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
      },
    });

    const count = await this.user.count();

    return paginateResponse([users, count], page, limit);
  }

  public stripUserPassword(user: User): Partial<User> {
    const { password, ...stripedUser } = user;

    return stripedUser;
  }

  // Optmized the exact query in the query optimization task
  public async getTopThreeAuthorsByPostCount(): Promise<any> {
    const users = await this.prisma.$queryRaw`
        WITH UserPostCounts AS (
        SELECT "authorId", COUNT(id)::INTEGER AS post_count
        FROM "Post"
        GROUP BY "authorId"
      ),
      LatestPosts AS (
        SELECT DISTINCT ON (p."authorId") 
          p."authorId", p.title, p.id AS "postId"
        FROM "Post" p
        ORDER BY p."authorId", p."createdAt" DESC
      ),
      LatestComments AS (
        SELECT DISTINCT ON (c."postId")
          c."postId", c.content
        FROM "Comment" c
        ORDER BY c."postId", c."createdAt" DESC
      )
      SELECT 
        u.id, 
        u.name, 
        lp.title AS latest_post_title, 
        lc.content AS latest_comment, 
        COALESCE(upc.post_count, 0) AS post_count
      FROM "User" u
      LEFT JOIN UserPostCounts upc ON u.id = upc."authorId"
      LEFT JOIN LatestPosts lp ON u.id = lp."authorId"
      LEFT JOIN LatestComments lc ON lp."postId" = lc."postId"
      ORDER BY post_count DESC
      LIMIT 3;`;

    return users;
  }

  // Query for the performance challenge
  public async getTopThreeAuthorsByPostCountWithTheirLatestComment(): Promise<any> {
    const users = await this.prisma.$queryRaw`
  WITH UserPostCounts AS (
    SELECT "authorId", COUNT(id)::INTEGER AS post_count
    FROM "Post"
    GROUP BY "authorId"
  ),
  LatestUserComments AS (
    SELECT DISTINCT ON (c."userId")
      c."userId", c.content, c."createdAt"
    FROM "Comment" c
    ORDER BY c."userId", c."createdAt" DESC
  )
  SELECT 
    u.id, 
    u.name, 
    COALESCE(upc.post_count, 0) AS post_count,
    luc.content AS latest_comment,
    luc."createdAt" AS latest_comment_date
  FROM "User" u
  LEFT JOIN UserPostCounts upc ON u.id = upc."authorId"
  LEFT JOIN LatestUserComments luc ON u.id = luc."userId"
  ORDER BY post_count DESC
  LIMIT 3;
`;
    return users;
  }
}
