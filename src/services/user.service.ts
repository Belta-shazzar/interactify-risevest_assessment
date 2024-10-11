import { SignUpDto } from "@/dto/auth.dto";
import { HttpException } from "@/exceptions/http.exception";
import { paginateResponse } from "@/utils/paginate";
import { PrismaClient, User } from "@prisma/client";
import httpStatus from "http-status";

export class UserService {
  private user = new PrismaClient().user;

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
}
