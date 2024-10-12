import { Post, PrismaClient, User } from "@prisma/client";
import { UserService } from "../../src/services/user.service";
import { PostService } from "../../src/services/post.service";
import { CommentService } from "../../src/services/comment.service";
import { CreateCommentDto } from "../../src/dto/comment.dto";
import { SignUpDto } from "../../src/dto/auth.dto";
import { CreatePostDto } from "../../src/dto/post.dto";
import { faker } from "@faker-js/faker";

let prisma: PrismaClient;

beforeAll(async () => {
  prisma = new PrismaClient();
  await prisma.$connect();
});

afterAll(async () => {
  await prisma.comment.deleteMany();
  await prisma.post.deleteMany();
  await prisma.user.deleteMany();

  await prisma.$disconnect();
});

describe("Comment Service", () => {
  it("should add comment from a user to a post", async () => {
    const commentService = new CommentService();
    const userService = new UserService();
    const postService = new PostService();

    const signUpDto: SignUpDto = {
      name: `${faker.person.firstName()} ${faker.person.lastName()}`,
      email: faker.internet.email(),
      password: "password",
    };

    const user = await userService.createUser(signUpDto);

    const postDto: CreatePostDto = {
      title: "Test post title",
      content: "Dummy content for post",
    };

    const post = await postService.createPost(postDto, user);

    const commentDto: CreateCommentDto = {
      content: "Test dummy comment",
    };

    const comment = await commentService.createComment(
      commentDto,
      user,
      post.id
    );
    expect(comment).toHaveProperty("id");
  });
});
