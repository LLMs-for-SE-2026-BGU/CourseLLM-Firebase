import { Test, TestingModule } from "@nestjs/testing";
import { UsersService } from "./users.service";
import { PrismaService } from "../database/prisma.service";
import { CustomLoggerService } from "../common/logger/logger.service";

describe("UsersService", () => {
  let service: UsersService;

  const mockPrismaService = {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
  };

  const mockLoggerService = {
    setContext: jest.fn(),
    info: jest.fn(),
    debug: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: CustomLoggerService,
          useValue: mockLoggerService,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("registerUser", () => {
    const registerDto = {
      userID: "user_123",
      name: "Test User",
      role: "student" as any,
      userInfo: { grade: "10" },
    };

    it("should register a new user", async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);
      mockPrismaService.user.create.mockResolvedValue({
        id: registerDto.userID,
        name: registerDto.name,
        role: registerDto.role,
        userInfo: registerDto.userInfo,
      });

      const result = await service.registerUser(registerDto);

      expect(result.success).toBe(true);
      expect(result.userID).toBe(registerDto.userID);
      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { id: registerDto.userID },
      });
      expect(mockPrismaService.user.create).toHaveBeenCalled();
    });

    it("should return success if user already exists (idempotent)", async () => {
      mockPrismaService.user.findUnique.mockResolvedValue({
        id: registerDto.userID,
        name: registerDto.name,
        role: registerDto.role,
        userInfo: registerDto.userInfo,
      });

      const result = await service.registerUser(registerDto);

      expect(result.success).toBe(true);
      expect(result.message).toContain("already registered");
      expect(mockPrismaService.user.create).not.toHaveBeenCalled();
    });

    it("should return error if database operation fails", async () => {
      mockPrismaService.user.findUnique.mockRejectedValue(
        new Error("Database error"),
      );

      const result = await service.registerUser(registerDto);

      expect(result.success).toBe(false);
      expect(result.message).toContain("Failed to register user");
    });
  });
});
