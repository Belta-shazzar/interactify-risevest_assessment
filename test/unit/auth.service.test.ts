import { AuthService } from "../../src/services/auth.service";
import { UserService } from "../../src/services/user.service";
import { sign } from "jsonwebtoken";
import { hash, compare } from "bcryptjs";
import { faker } from "@faker-js/faker";
import { User } from "@prisma/client";
import { LoginDto, SignUpDto } from "../../src/dto/auth.dto";
import { HttpException } from "../../src/exceptions/http.exception";
import config from "../../src/config";
import { generateUUID } from "../util";

// Mock the UserService module
jest.mock("../../src/services/user.service", () => {
  return {
    UserService: jest.fn().mockImplementation(() => ({
      getUserByEmail: jest.fn(),
      createUser: jest.fn(),
      stripUserPassword: jest.fn(),
    })),
  };
});

// Mock bcrypt
jest.mock("bcryptjs", () => ({
  hash: jest.fn(),
  compare: jest.fn(),
}));

// Mock jsonwebtoken
jest.mock("jsonwebtoken", () => ({
  sign: jest.fn(),
}));

describe("AuthService unit test", () => {
  let authService: AuthService;
  let userServiceInstance: jest.Mocked<UserService>;

  const userId: string = generateUUID();
  const name: string = `${faker.person.firstName()} ${faker.person.lastName()}`;
  const email: string = faker.internet.email();

  const mockUser: User = {
    id: userId,
    name,
    email,
    password: "hashedPassword",
    createdAt: new Date(),
    updatedAt: new Date(),
    deletedAt: null,
  };

  beforeEach(() => {
    jest.clearAllMocks();

    authService = new AuthService();
    userServiceInstance = (authService as any).userService; // Get the mocked UserService instance

    // Mock the private createToken method
    jest
      .spyOn(authService as any, "createToken")
      .mockImplementation(() => "mock-jwt-token");

    // Mock jsonwebtoken sign function
    (sign as jest.Mock).mockReturnValue("mock-jwt-token");
  });

  describe("Sign up cases", () => {
    const mockSignUpDto: SignUpDto = {
      name,
      email,
      password: "password",
    };

    it("should successfully create a new user and return auth data", async () => {
      const hashedPassword = "hashedPassword";

      // Setup mocks
      (hash as jest.Mock).mockResolvedValue(hashedPassword);
      userServiceInstance.getUserByEmail.mockResolvedValue(null);
      userServiceInstance.createUser.mockResolvedValue(mockUser);
      userServiceInstance.stripUserPassword.mockReturnValue({
        ...mockUser,
        password: undefined,
      });

      const result = await authService.signUp(mockSignUpDto);

      expect(userServiceInstance.getUserByEmail).toHaveBeenCalledWith(
        mockSignUpDto.email
      );
      expect(hash).toHaveBeenCalledWith(mockSignUpDto.password, 10);
      expect(userServiceInstance.createUser).toHaveBeenCalledWith({
        ...mockSignUpDto,
        password: hashedPassword,
      });
      expect(userServiceInstance.stripUserPassword).toHaveBeenCalledWith(
        mockUser
      );
      expect((authService as any).createToken).toHaveBeenCalledWith(
        mockUser.id
      );
      expect(result).toEqual({
        user: { ...mockUser, password: undefined },
        token: "mock-jwt-token",
      });
    });

    it("should throw HttpException when email already exists", async () => {
      userServiceInstance.getUserByEmail.mockResolvedValue(mockUser);

      // Execute and verify
      await expect(authService.signUp(mockSignUpDto)).rejects.toThrow(
        HttpException
      );
      expect(userServiceInstance.getUserByEmail).toHaveBeenCalledWith(
        mockSignUpDto.email
      );
      expect(hash).not.toHaveBeenCalled();
      expect(userServiceInstance.createUser).not.toHaveBeenCalled();
    });
  });

  describe("Login cases", () => {
    const mockLoginDto: LoginDto = {
      email,
      password: "password",
    };

    it("should successfully log user in", async () => {
      userServiceInstance.getUserByEmail.mockResolvedValue(mockUser);
      (compare as jest.Mock).mockResolvedValue(true);
      userServiceInstance.stripUserPassword.mockReturnValue({
        ...mockUser,
        password: undefined,
      });

      const result = await authService.login(mockLoginDto);

      expect(userServiceInstance.getUserByEmail).toHaveBeenCalledWith(
        mockLoginDto.email
      );
      expect(compare).toHaveBeenCalledWith(
        mockLoginDto.password,
        mockUser.password
      );
      expect(userServiceInstance.stripUserPassword).toHaveBeenCalledWith(
        mockUser
      );
      expect((authService as any).createToken).toHaveBeenCalledWith(
        mockUser.id
      );
      expect(result).toEqual({
        user: { ...mockUser, password: undefined },
        token: "mock-jwt-token",
      });
    });

    it("should throw HttpException when incorrect email is sent", async () => {
      const mockLoginDto: LoginDto = {
        email: faker.internet.email(),
        password: "password",
      };

      userServiceInstance.getUserByEmail.mockResolvedValue(null);

      // Execute and verify
      await expect(authService.login(mockLoginDto)).rejects.toThrow(
        HttpException
      );
      expect(userServiceInstance.getUserByEmail).toHaveBeenCalledWith(
        mockLoginDto.email
      );
      expect(compare).not.toHaveBeenCalled();
    });

    it("should throw HttpException when incorrect password is sent", async () => {
      userServiceInstance.getUserByEmail.mockResolvedValue(mockUser);
      (compare as jest.Mock).mockResolvedValue(false);

      // Execute and verify
      await expect(authService.login(mockLoginDto)).rejects.toThrow(
        HttpException
      );
      expect(userServiceInstance.getUserByEmail).toHaveBeenCalledWith(
        mockLoginDto.email
      );
      expect(compare).toHaveBeenCalled();
    });
  });

  describe("createToken", () => {
    it("should create a valid JWT token", () => {
      // Remove the private function mock implementation for this test
      (authService as any).createToken.mockRestore();

      const expectedPayload = { id: userId };

      // Call the private method
      const token = (authService as any).createToken(userId);

      expect(sign).toHaveBeenCalledWith(expectedPayload, config.app.jwtSecret, {
        expiresIn: 60 * 3600,
      });
      expect(typeof token).toBe("string");
    });
  });
});
