import { PrismaClient, Comment, Post, User } from "@prisma/client";
import { DeepMockProxy, mockDeep } from "jest-mock-extended";
import { CommentService } from "../../src/services/comment.service";
import { PostService } from "../../src/services/post.service";
import { CreateCommentDto } from "../../src/dto/comment.dto";
import prisma from "../../src/config/prisma";
import { generateUUID } from "../util";
import { faker } from "@faker-js/faker";

jest.mock("../../src/config/prisma", () => ({
  __esModule: true,
  default: mockDeep<PrismaClient>(),
}));

jest.mock("../../src/services/post.service.ts");

const mockedPrisma = prisma as unknown as DeepMockProxy<PrismaClient>;
const MockedPostService = PostService as jest.MockedClass<typeof PostService>;

describe("CommentService unit test", () => {
  let commentService: CommentService;
  let postServiceInstance: jest.Mocked<PostService>;

  const postId = generateUUID();
  const content = "This is a test comment";

  const user: Partial<User> = {
    id: generateUUID(),
    name: `${faker.person.firstName()} ${faker.person.lastName()}`,
    email: faker.internet.email(),
  };

  const expectedComment: Comment = {
    id: generateUUID(),
    content,
    userId: user.id!,
    postId: postId,
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    commentService = new CommentService();
    postServiceInstance = new MockedPostService() as jest.Mocked<PostService>;
    (commentService as any).post = postServiceInstance;
  });

  describe("createComment", () => {
    const commentDto: CreateCommentDto = {
      content,
    };
    
    it("should create a new comment", async () => {
      const mockPost: Post = {
        id: postId,
        title: "Test Post",
        content: "This is a test post",
        authorId: user.id!,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      };

      postServiceInstance.getPostById.mockResolvedValue(mockPost);

      mockedPrisma.comment.create.mockResolvedValue(expectedComment);

      const result = await commentService.createComment(
        commentDto,
        user,
        postId
      );

      expect(postServiceInstance.getPostById).toHaveBeenCalledWith(postId);
      expect(mockedPrisma.comment.create).toHaveBeenCalledWith({
        data: {
          ...commentDto,
          userId: user.id,
          postId: mockPost.id,
        },
      });
      expect(result).toEqual(expectedComment);
    });

    it("should throw an error if the post is not found", async () => {
      postServiceInstance.getPostById.mockRejectedValue(
        new Error("Post not found")
      );

      await expect(
        commentService.createComment(commentDto, user, postId)
      ).rejects.toThrow("Post not found");
      expect(postServiceInstance.getPostById).toHaveBeenCalledWith(postId);
      expect(mockedPrisma.comment.create).not.toHaveBeenCalled();
    });
  });
});
