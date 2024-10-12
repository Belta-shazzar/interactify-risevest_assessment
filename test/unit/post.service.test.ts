import { PrismaClient, User } from "@prisma/client";
import { UserService } from "../../src/services/user.service";
import { PostService } from "../../src/services/post.service";
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

describe("Post Service", () => {
  const postDto: CreatePostDto = {
    title: "Test post title",
    content: "Dummy content for post",
  };
  it("should create post", async () => {
    const postService = new PostService();
    const userService = new UserService();

    const signUpDto: SignUpDto = {
      name: `${faker.person.firstName()} ${faker.person.lastName()}`,
      email: faker.internet.email(),
      password: "password",
    };

    const user = await userService.createUser(signUpDto);

    const post = await postService.createPost(postDto, user);
    expect(post).toHaveProperty("id");
    expect(post).toHaveProperty("authorId");
  });

  it("should get post by id", async () => {
    const postService = new PostService();
    const userService = new UserService();

    const signUpDto: SignUpDto = {
      name: `${faker.person.firstName()} ${faker.person.lastName()}`,
      email: faker.internet.email(),
      password: "password",
    };

    const user = await userService.createUser(signUpDto);

    const newPost = await postService.createPost(postDto, user);

    const post = await postService.getPostById(newPost.id);

    expect(post).toHaveProperty("id");
    expect(post).toHaveProperty("authorId");
    expect(post.id).toEqual(newPost.id);
  });

  it("should get all author's post", async () => {
    const postService = new PostService();
    const userService = new UserService();

    const signUpDto: SignUpDto = {
      name: `${faker.person.firstName()} ${faker.person.lastName()}`,
      email: faker.internet.email(),
      password: "password",
    };

    const user = await userService.createUser(signUpDto);

    await postService.createPost(postDto, user);

    const response = await postService.getPostsByAuthorId(user.id, 1, 10);

    expect(Array.isArray(response.data)).toBe(true);
    expect(response.data[0]).toHaveProperty("id");
    expect(response.data[0]).toHaveProperty("authorId");
    expect(response.data[0].authorId).toEqual(user.id);
    expect(typeof response.count).toBe("number");
    expect(typeof response.currentPage).toBe("number");
  });
});
