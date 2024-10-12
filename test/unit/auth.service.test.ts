import { PrismaClient } from "@prisma/client";
import { AuthService } from "../../src/services/auth.service";
import { LoginDto, SignUpDto } from "../../src/dto/auth.dto";
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

describe("Auth Service", () => {
  it("should sign user up", async () => {
    const authService = new AuthService();

    const signUpDto: SignUpDto = {
      name: `${faker.person.firstName()} ${faker.person.lastName()}`,
      email: faker.internet.email(),
      password: "password",
    };

    const response = await authService.signUp(signUpDto);
    expect(response.user).toHaveProperty("id");
    expect(typeof response.token).toBe("string");
  });

  it("should log user in", async () => {
    const authService = new AuthService();
    const email: string = faker.internet.email();

    const signUpDto: SignUpDto = {
      name: `${faker.person.firstName()} ${faker.person.lastName()}`,
      email,
      password: "password",
    };

    await authService.signUp(signUpDto);

    const loginDto: LoginDto = {
      email,
      password: "password",
    };

    const response = await authService.login(loginDto);
    expect(response.user).toHaveProperty("id");
    expect(typeof response.token).toBe("string");
  });
});
