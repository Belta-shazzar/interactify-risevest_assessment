import { PrismaClient, User } from "@prisma/client";
import { DeepMockProxy, mockDeep } from "jest-mock-extended";
import httpStatus from "http-status";
import { HttpException } from "../../src/exceptions/http.exception";
import prisma from "../../src/config/prisma";
import { UserService } from "../../src/services/user.service";
import { SignUpDto } from "../../src/dto/auth.dto";
import { faker } from "@faker-js/faker";
import { generateUUID } from "../util";

// Mock the prisma config module
jest.mock("../../src/config/prisma.ts", () => ({
  __esModule: true,
  default: mockDeep<PrismaClient>(),
}));

const mockedPrisma = prisma as unknown as DeepMockProxy<PrismaClient>;

describe("UserService unit test", () => {
  let userService: UserService;

  const userId: string = generateUUID();
  const email: string = faker.internet.email();
  const name: string = `${faker.person.firstName()} ${faker.person.lastName()}`;

  const expectedUser: User = {
    id: userId,
    name,
    email,
    password: "password",
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    userService = new UserService();
  });

  describe("createUser", () => {
    it("should create a new user", async () => {
      const signUpDto: SignUpDto = {
        email,
        name,
        password: "password",
      };

      mockedPrisma.user.create.mockResolvedValue(expectedUser);

      const result = await userService.createUser(signUpDto);

      expect(mockedPrisma.user.create).toHaveBeenCalledWith({
        data: signUpDto,
      });
      expect(result).toEqual(expectedUser);
    });
  });

  describe("getUserByEmail", () => {
    it("should return a user when found", async () => {
      mockedPrisma.user.findUnique.mockResolvedValue(expectedUser);

      const result = await userService.getUserByEmail(email);

      expect(mockedPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { email },
      });
      expect(result).toEqual(expectedUser);
    });

    it("should return null when user is not found", async () => {
      mockedPrisma.user.findUnique.mockResolvedValue(null);

      const result = await userService.getUserByEmail(email);

      expect(mockedPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { email },
      });
      expect(result).toBeNull();
    });
  });

  describe("getUserById", () => {
    it("should return a user when found", async () => {
      mockedPrisma.user.findUnique.mockResolvedValue(expectedUser);

      const result = await userService.getUserById(userId);

      expect(mockedPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: userId },
      });
      expect(result).toEqual(expectedUser);
    });

    it("should throw HttpException when user is not found", async () => {
      mockedPrisma.user.findUnique.mockResolvedValue(null);

      await expect(userService.getUserById(userId)).rejects.toThrow(
        new HttpException(httpStatus.NOT_FOUND, "User does not exist")
      );

      expect(mockedPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: userId },
      });
    });
  });

  describe("getUsers", () => {
    it("should return paginated users", async () => {
      const page = 1;
      const limit = 10;
      const mockUsers: Partial<User>[] = [
        {
          id: generateUUID(),
          email: faker.internet.email(),
          name: `${faker.person.firstName()} ${faker.person.lastName()}`,
          createdAt: new Date(),
        },
        {
          id: generateUUID(),
          email: faker.internet.email(),
          name: `${faker.person.firstName()} ${faker.person.lastName()}`,
          createdAt: new Date(),
        },
      ];
      const totalCount = 2;

      mockedPrisma.user.findMany.mockResolvedValue(mockUsers as User[]);
      mockedPrisma.user.count.mockResolvedValue(totalCount);

      const result = await userService.getUsers(page, limit);

      expect(mockedPrisma.user.findMany).toHaveBeenCalledWith({
        skip: 0,
        take: limit,
        select: {
          id: true,
          email: true,
          name: true,
          createdAt: true,
        },
      });
      expect(mockedPrisma.user.count).toHaveBeenCalled();
      expect(result).toHaveProperty("data", mockUsers);
      expect(result).toHaveProperty("count", totalCount);
      expect(result).toHaveProperty("currentPage");
      expect(result).toHaveProperty("nextPage");
      expect(result).toHaveProperty("prevPage");
    });
  });

  describe("stripUserPassword", () => {
    it("should remove password from user object", () => {
      const result = userService.stripUserPassword(expectedUser);

      expect(result).not.toHaveProperty("password");
      expect(result).toEqual({
        id: userId,
        email,
        name,
        createdAt: expectedUser.createdAt,
        updatedAt: expectedUser.updatedAt,
        deletedAt: expectedUser.deletedAt,
      });
    });
  });

  describe("Query optimization task", () => {
    it("should get the top three author with the most post", async () => {
      const mockUsers: any[] = [
        {
          id: generateUUID(),
          name: `${faker.person.firstName()} ${faker.person.lastName()}`,
          latest_post_title: "This is a test title",
          latest_comment: "This is a test comment for post",
          post_count: 10,
        },
        {
          id: generateUUID(),
          name: `${faker.person.firstName()} ${faker.person.lastName()}`,
          latest_post_title: "This is a test title",
          latest_comment: "This is a test comment for post",
          post_count: 9,
        },
        {
          id: generateUUID(),
          name: `${faker.person.firstName()} ${faker.person.lastName()}`,
          latest_post_title: "This is a test title",
          latest_comment: "This is a test comment for post",
          post_count: 8,
        },
      ];

      mockedPrisma.$queryRaw.mockResolvedValue(mockUsers);

      const result = await userService.getTopThreeAuthorsByPostCount();

      expect(mockedPrisma.$queryRaw).toHaveBeenCalled();
      expect(result).toBeInstanceOf(Array);
      expect(result.length).toEqual(3);
      expect(result[0]).toHaveProperty("name");
      expect(result[0]).toHaveProperty("latest_post_title");
      expect(result[0]).toHaveProperty("post_count");
    });

    it("should get the top three author with the most post, along side the latest comments those users made", async () => {
      const mockUsers: any[] = [
        {
          id: generateUUID(),
          name: `${faker.person.firstName()} ${faker.person.lastName()}`,
          post_count: 10,
          latest_comment: "This is a test comment for post",
          latest_comment_date: new Date(),
        },
        {
          id: generateUUID(),
          name: `${faker.person.firstName()} ${faker.person.lastName()}`,
          post_count: 9,
          latest_comment: "This is a test comment for post",
          latest_comment_date: new Date(),
        },
        {
          id: generateUUID(),
          name: `${faker.person.firstName()} ${faker.person.lastName()}`,
          post_count: 8,
          latest_comment: "This is a test comment for post",
          latest_comment_date: new Date(),
        },
      ];

      mockedPrisma.$queryRaw.mockResolvedValue(mockUsers);

      const result =
        await userService.getTopThreeAuthorsByPostCountWithTheirLatestComment();

      expect(mockedPrisma.$queryRaw).toHaveBeenCalled();
      expect(result).toBeInstanceOf(Array);
      expect(result.length).toEqual(3);
      expect(result[0]).toHaveProperty("name");
      expect(result[0]).toHaveProperty("post_count");
      expect(result[0]).toHaveProperty("latest_comment");
      expect(result[0]).toHaveProperty("latest_comment_date");
    });
  });
});
