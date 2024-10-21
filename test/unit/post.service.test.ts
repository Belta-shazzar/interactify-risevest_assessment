import { Post, PrismaClient, User } from "@prisma/client";
import { DeepMockProxy, mockDeep } from "jest-mock-extended";
import httpStatus from "http-status";
import { HttpException } from "../../src/exceptions/http.exception";
import prisma from "../../src/config/prisma";
import { PostService } from "../../src/services/post.service";
import { generateUUID } from "../util";
import { CreatePostDto } from "../../src/dto/post.dto";
import { faker } from "@faker-js/faker";
import redis, { closeRedis } from "../../src/config/redis";

jest.mock("../../src/config/prisma.ts", () => ({
  __esModule: true,
  default: mockDeep<PrismaClient>(),
}));

jest.mock("../../src/config/redis.ts", () => {
  const redisMock = {
    get: jest.fn(),
    set: jest.fn(),
    quit: jest.fn(),
  };
  return {
    __esModule: true,
    default: redisMock,
    getRedis: () => redisMock,
  };
});

const mockedPrisma = prisma as unknown as DeepMockProxy<PrismaClient>;

describe("PostService unit test", () => {
  let postService: PostService;

  const postId: string = generateUUID();
  const authorId: string = generateUUID();
  const postTitle: string = "New Post Title";
  const postContent: string = "The content for this post";

  const expectedPost: Post = {
    id: postId,
    authorId,
    title: postTitle,
    content: postContent,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    postService = new PostService();
  });

  describe("createPost", () => {
    const postDto: CreatePostDto = {
      title: postTitle,
      content: postContent,
    };

    const author: Partial<User> = {
      id: authorId,
      name: `${faker.person.firstName()} ${faker.person.lastName()}`,
      email: faker.internet.email(),
      password: "password",
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
    };
    it("should create a post and cache it", async () => {
      mockedPrisma.post.create.mockResolvedValue(expectedPost);
      (redis.set as jest.Mock).mockResolvedValue("OK");

      const result = await postService.createPost(postDto, author);

      expect(mockedPrisma.post.create).toHaveBeenCalledWith({
        data: { ...postDto, authorId: author.id },
      });

      expect(redis.set).toHaveBeenCalledWith(
        expectedPost.id,
        JSON.stringify(expectedPost)
      );

      expect(result).toEqual(expectedPost);
    });

    it("should create post even if redis caching fails", async () => {
      mockedPrisma.post.create.mockResolvedValue(expectedPost);
      (redis.set as jest.Mock).mockRejectedValue(
        new Error("Failed to cache post in Redis:")
      );

      const result = await postService.createPost(postDto, author);

      expect(result).toEqual(expectedPost);
      expect(prisma.post.create).toHaveBeenCalledTimes(1);
    });
  });

  describe("getPostById", () => {
    it("should return post from cache if available", async () => {
      (redis.get as jest.Mock).mockResolvedValue(JSON.stringify(expectedPost));

      const result = await postService.getPostById(expectedPost.id);

      expect(redis.get).toHaveBeenCalledWith(expectedPost.id);
      expect(mockedPrisma.post.findUnique).not.toHaveBeenCalled();
      expect(JSON.stringify(result)).toEqual(JSON.stringify(expectedPost));
    });

    it("should fetch from database and cache if not in cache", async () => {
      (redis.get as jest.Mock).mockResolvedValue(null);
      mockedPrisma.post.findUnique.mockResolvedValue(expectedPost);
      (redis.set as jest.Mock).mockResolvedValue("OK");

      const result = await postService.getPostById(expectedPost.id);

      expect(redis.get).toHaveBeenCalledWith(expectedPost.id);
      expect(mockedPrisma.post.findUnique).toHaveBeenCalledWith({
        where: { id: expectedPost.id },
      });
      expect(redis.set).toHaveBeenCalledWith(
        expectedPost.id,
        JSON.stringify(expectedPost)
      );
      expect(result).toEqual(expectedPost);
    });

    it("should throw HttpException when user is not found", async () => {
      mockedPrisma.post.findUnique.mockResolvedValue(null);

      await expect(postService.getPostById(postId)).rejects.toThrow(
        new HttpException(httpStatus.NOT_FOUND, "Post does not exist")
      );

      expect(mockedPrisma.post.findUnique).toHaveBeenCalledWith({
        where: { id: postId },
      });
    });
  });

  describe("getPostsByAuthorId", () => {
    it("should return paginated posts by an author's id", async () => {
      const page = 1;
      const limit = 10;
      const authorId = generateUUID();

      const mockPosts: Post[] = [
        {
          id: generateUUID(),
          authorId,
          title: "Title One",
          content: "Content One",
          createdAt: new Date(),
          updatedAt: new Date(),
          deletedAt: null,
        },
        {
          id: generateUUID(),
          authorId,
          title: "Title Two",
          content: "Content Two",
          createdAt: new Date(),
          updatedAt: new Date(),
          deletedAt: null,
        },
      ];
      const totalCount = 2;

      mockedPrisma.post.findMany.mockResolvedValue(mockPosts as Post[]);
      mockedPrisma.post.count.mockResolvedValue(totalCount);

      const result = await postService.getPostsByAuthorId(
        authorId,
        page,
        limit
      );

      expect(mockedPrisma.post.findMany).toHaveBeenCalledWith({
        skip: 0,
        take: limit,
        where: { authorId },
      });
      expect(mockedPrisma.post.count).toHaveBeenCalled();
      expect(result).toHaveProperty("data", mockPosts);
      expect(result).toHaveProperty("count", totalCount);
      expect(result).toHaveProperty("currentPage");
      expect(result).toHaveProperty("nextPage");
      expect(result).toHaveProperty("prevPage");
    });
  });
});
