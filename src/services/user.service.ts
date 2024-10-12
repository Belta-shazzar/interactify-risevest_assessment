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

  public async getTopThreeAuthorsByPostCount(): Promise<any> {
    const users = await this.prisma.$queryRaw`
    WITH LatestComments AS (
      SELECT "c.postId", c.content, "c.createdAt",
             ROW_NUMBER() OVER (PARTITION BY "c.postId" ORDER BY "c.createdAt" DESC) as rn
      FROM "Comment" c
    )
    SELECT u.id, u.name, p.title, lc.content
    FROM "User" u
    LEFT JOIN "Post" p ON u.id = "p.authorId"
    LEFT JOIN LatestComments lc ON p.id = "lc.postId" AND lc.rn = 1
    GROUP BY u.id, u.name, p.title, lc.content
    ORDER BY COUNT(p.id) DESC
    LIMIT 3;
  `;

    return users;
  }

  public async getTopThreeAuthorsByPostCountWithTheirLatestComment(): Promise<any> {
    const users = await this.prisma.$queryRaw`
    WITH TopUsers AS (
        SELECT 
            u.id,
            u.name,
            u.email,
            COUNT(p.id) AS post_count
        FROM users u
        JOIN posts p ON u.id = p.authorId
        GROUP BY u.id, u.name, u.email
        ORDER BY post_count DESC
        LIMIT 3
    ),
    LatestComments AS (
        SELECT 
            c.userId,
            c.content,
            c.createdAt,
            ROW_NUMBER() OVER (PARTITION BY c.userId ORDER BY c.createdAt DESC) AS rn
        FROM comments c
    )
    SELECT 
        tu.id AS userId,
        tu.name,
        tu.email,
        tu.post_count,
        lc.comment_text AS latest_comment
    FROM TopUsers tu
    LEFT JOIN LatestComments lc ON tu.id = lc.userId
    WHERE lc.rn = 1;
  `;

    return users;
  }
}
