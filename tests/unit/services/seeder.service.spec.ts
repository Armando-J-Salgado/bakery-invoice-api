import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SeederService } from '../../../src/seeds/seeder.service';
import { User } from '../../../src/entities/user.entity';

describe('SeederService - Unit Tests', () => {
  let service: SeederService;
  let userRepository: Repository<User>;

  const mockAdminUser = {
    id: 1,
    email: 'admin@example.com',
    username: 'admin',
    name: 'Admin',
    lastname: 'User',
    password: '$2b$10$hashedPassword',
    role: 'Admin',
  };

  beforeEach(async () => {
    // Set environment variables for testing
    process.env.ADMIN_EMAIL = 'admin@example.com';
    process.env.ADMIN_PASSWORD = 'test1234';
    process.env.ADMIN_USERNAME = 'admin';
    process.env.ADMIN_NAME = 'Admin';
    process.env.ADMIN_LASTNAME = 'User';

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SeederService,
        {
          provide: getRepositoryToken(User),
          useClass: Repository,
        },
      ],
    })
      .overrideProvider(getRepositoryToken(User))
      .useValue({
        findOne: jest.fn(),
        create: jest.fn(),
        save: jest.fn(),
      })
      .compile();

    service = module.get<SeederService>(SeederService);
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
  });

  afterEach(() => {
    // Clean up environment variables
    delete process.env.ADMIN_EMAIL;
    delete process.env.ADMIN_PASSWORD;
    delete process.env.ADMIN_USERNAME;
    delete process.env.ADMIN_NAME;
    delete process.env.ADMIN_LASTNAME;
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('seed', () => {
    it('should skip seeding if admin user already exists', async () => {
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(mockAdminUser as User);

      await service.seed();

      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { email: 'admin@example.com' },
      });
      expect(userRepository.create).not.toHaveBeenCalled();
      expect(userRepository.save).not.toHaveBeenCalled();
    });

    it('should create admin user if it does not exist', async () => {
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(null);
      jest.spyOn(userRepository, 'create').mockReturnValue(mockAdminUser as User);
      jest.spyOn(userRepository, 'save').mockResolvedValue(mockAdminUser as User);

      await service.seed();

      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { email: 'admin@example.com' },
      });
      expect(userRepository.create).toHaveBeenCalledWith(expect.objectContaining({
        email: 'admin@example.com',
        username: 'admin',
        name: 'Admin',
        lastname: 'User',
        role: 'Admin',
      }));
      expect(userRepository.save).toHaveBeenCalled();
    });

    it('should use default password if ADMIN_PASSWORD is not set', async () => {
      delete process.env.ADMIN_PASSWORD;
      
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(null);
      jest.spyOn(userRepository, 'create').mockReturnValue(mockAdminUser as User);
      jest.spyOn(userRepository, 'save').mockResolvedValue(mockAdminUser as User);

      await service.seed();

      expect(userRepository.create).toHaveBeenCalled();
      expect(userRepository.save).toHaveBeenCalled();
    });
  });
});
