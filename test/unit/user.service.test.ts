import { PrismaClient } from "@prisma/client";
import { UserService } from "../../src/services/user.service";
import { SignUpDto } from "../../src/dto/auth.dto";
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

describe("User Service", () => {
  it("should create user", async () => {
    const userService = new UserService();

    const signUpDto: SignUpDto = {
      name: `${faker.person.firstName()} ${faker.person.lastName()}`,
      email: faker.internet.email(),
      password: "password",
    };

    const user = await userService.createUser(signUpDto);
    expect(user).toHaveProperty("id");
  });

  it("should get user by id", async () => {
    const userService = new UserService();

    const signUpDto: SignUpDto = {
      name: `${faker.person.firstName()} ${faker.person.lastName()}`,
      email: faker.internet.email(),
      password: "password",
    };

    const createdUser = await userService.createUser(signUpDto);
    const user = await userService.getUserById(createdUser.id);
    expect(user).toHaveProperty("id");
    expect(user).toHaveProperty("email");
  });

  it("should get users", async () => {
    const userService = new UserService();

    const signUpDto: SignUpDto = {
      name: `${faker.person.firstName()} ${faker.person.lastName()}`,
      email: faker.internet.email(),
      password: "password",
    };

    await userService.createUser(signUpDto);
    const response = await userService.getUsers(1, 10);

    expect(Array.isArray(response.data)).toBe(true);
    expect(response.data[0]).toHaveProperty("id");
    expect(typeof response.count).toBe("number");
    expect(typeof response.currentPage).toBe("number");
  });

  it("should get top three users", async () => {
    const userService = new UserService();

    const response = await userService.getTopThreeAuthorsByPostCount();

    expect(Array.isArray(typeof response)).toBe("object");
  });
  it("should get top three users with their last comments", async () => {
    const userService = new UserService();

    const response =
      await userService.getTopThreeAuthorsByPostCountWithTheirLatestComment();

    expect(Array.isArray(typeof response)).toBe("object");
  });
});
