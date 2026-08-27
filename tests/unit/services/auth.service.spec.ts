import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { AuthService } from '../../../src/modules/auth/auth.service';
import { User } from '../../../src/entities/user.entity';
import { LoginDto } from '../../../src/modules/auth/dto/login.dto';

// Mock bcrypt module
jest.mock('bcrypt', () => ({
  compare: jest.fn(),
}));

describe('AuthService - Unit Tests', () => {
  let service: AuthService;
  let userRepository: Repository<User>;
  let jwtService: JwtService;

  const mockUser = {
    id: 1,
    email: 'test@example.com',
    password: '$2b$10$hashedPassword',
    role: 'admin',
    created_at: new Date(),
    updated_at: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: getRepositoryToken(User),
          useClass: Repository,
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn(),
          },
        },
      ],
    })
      .overrideProvider(getRepositoryToken(User))
      .useValue({
        findOne: jest.fn(),
      })
      .compile();

    service = module.get<AuthService>(AuthService);
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
    jwtService = module.get<JwtService>(JwtService);
    
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('validateUser', () => {
    it('should return user without password when credentials are valid', async () => {
      (userRepository.findOne as jest.Mock).mockResolvedValue(mockUser as User);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.validateUser('test@example.com', 'password123');

      expect(result).toEqual({
        id: mockUser.id,
        email: mockUser.email,
        role: mockUser.role,
        created_at: mockUser.created_at,
        updated_at: mockUser.updated_at,
      });
      expect(result.password).toBeUndefined();
      expect(userRepository.findOne).toHaveBeenCalledWith({ where: { email: 'test@example.com' } });
      expect(bcrypt.compare).toHaveBeenCalledWith('password123', mockUser.password);
    });

    it('should throw UnauthorizedException when user not found', async () => {
      (userRepository.findOne as jest.Mock).mockResolvedValue(null);

      await expect(service.validateUser('nonexistent@example.com', 'password123'))
        .rejects.toThrow(UnauthorizedException);
      await expect(service.validateUser('nonexistent@example.com', 'password123'))
        .rejects.toThrow('Invalid credentials');
      expect(userRepository.findOne).toHaveBeenCalledWith({ where: { email: 'nonexistent@example.com' } });
      expect(bcrypt.compare).not.toHaveBeenCalled();
    });

    it('should throw UnauthorizedException when password is invalid', async () => {
      (userRepository.findOne as jest.Mock).mockResolvedValue(mockUser as User);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(service.validateUser('test@example.com', 'wrongpassword'))
        .rejects.toThrow(UnauthorizedException);
      await expect(service.validateUser('test@example.com', 'wrongpassword'))
        .rejects.toThrow('Invalid credentials');
      expect(bcrypt.compare).toHaveBeenCalledWith('wrongpassword', mockUser.password);
    });
  });

  describe('login', () => {
    const loginDto: LoginDto = {
      email: 'test@example.com',
      password: 'password123',
    };

    it('should return access token when login is successful', async () => {
      const userWithoutPassword = {
        id: mockUser.id,
        email: mockUser.email,
        role: mockUser.role,
        created_at: mockUser.created_at,
        updated_at: mockUser.updated_at,
      };

      const validateUserSpy = jest.spyOn(service, 'validateUser').mockResolvedValue(userWithoutPassword as any);
      (jwtService.sign as jest.Mock).mockReturnValue('fake-jwt-token');

      const result = await service.login(loginDto);

      expect(result).toEqual({ access_token: 'fake-jwt-token' });
      expect(validateUserSpy).toHaveBeenCalledWith(loginDto.email, loginDto.password);
      expect(jwtService.sign).toHaveBeenCalledWith(
        { email: mockUser.email, sub: mockUser.id, role: mockUser.role },
        { expiresIn: '24h' },
      );
      
      validateUserSpy.mockRestore();
    });

    it('should throw UnauthorizedException when credentials are invalid', async () => {
      const validateUserSpy = jest.spyOn(service, 'validateUser').mockRejectedValue(
        new UnauthorizedException('Invalid credentials'),
      );

      await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
      
      validateUserSpy.mockRestore();
    });
  });

  describe('logout', () => {
    it('should return success message', async () => {
      const result = await service.logout();

      expect(result).toEqual({ message: 'Logged out successfully' });
    });
  });
});
