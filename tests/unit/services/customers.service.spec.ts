import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { CustomersService } from '../../../src/modules/customers/customers.service';
import { Customer } from '../../../src/entities/customer.entity';
import { ProductVariantsService } from '../../../src/modules/product-variants/product-variants.service';
import { CreateCustomerDto } from '../../../src/modules/customers/dto/create-customer.dto';
import { UpdateCustomerDto } from '../../../src/modules/customers/dto/update-customer.dto';

describe('CustomersService - Unit Tests', () => {
  let service: CustomersService;
  let customerRepository: Repository<Customer>;
  let productVariantService: ProductVariantsService;

  const mockProductVariant = {
    id: 1,
    productId: 1,
    name: 'Test Variant',
    price: 100,
    stock: 50,
  };

  const mockCustomer: Partial<Customer> = {
    id: 1,
    name: 'John Doe',
    email: 'john@example.com',
    address: '123 Main St',
    phoneNumber: '+1234567890',
    favoriteProductId: 1,
    created_at: new Date(),
    updated_at: new Date(),
    deleted_at: null,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CustomersService,
        {
          provide: getRepositoryToken(Customer),
          useClass: Repository,
        },
        {
          provide: ProductVariantsService,
          useValue: {
            findOne: jest.fn(),
          },
        },
      ],
    })
      .overrideProvider(getRepositoryToken(Customer))
      .useValue({
        create: jest.fn(),
        save: jest.fn(),
        findOne: jest.fn(),
        update: jest.fn(),
        softRemove: jest.fn(),
        recover: jest.fn(),
        createQueryBuilder: jest.fn(),
      })
      .compile();

    service = module.get<CustomersService>(CustomersService);
    customerRepository = module.get<Repository<Customer>>(getRepositoryToken(Customer));
    productVariantService = module.get<ProductVariantsService>(ProductVariantsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a customer successfully without favorite product', async () => {
      const createDto: CreateCustomerDto = {
        name: 'John Doe',
        email: 'john@example.com',
      };

      jest.spyOn(customerRepository, 'create').mockReturnValue(createDto as any);
      jest.spyOn(customerRepository, 'save').mockResolvedValue(mockCustomer as Customer);

      const result = await service.create(createDto);

      expect(result).toEqual(mockCustomer);
      expect(customerRepository.create).toHaveBeenCalledWith(createDto);
      expect(customerRepository.save).toHaveBeenCalledWith(createDto);
    });

    it('should create a customer successfully with valid favorite product', async () => {
      const createDto: CreateCustomerDto = {
        name: 'John Doe',
        email: 'john@example.com',
        favoriteProductId: 1,
      };

      jest.spyOn(productVariantService, 'findOne').mockResolvedValue(mockProductVariant as any);
      jest.spyOn(customerRepository, 'create').mockReturnValue(createDto as any);
      jest.spyOn(customerRepository, 'save').mockResolvedValue(mockCustomer as Customer);

      const result = await service.create(createDto);

      expect(result).toEqual(mockCustomer);
      expect(productVariantService.findOne).toHaveBeenCalledWith(1);
      expect(customerRepository.create).toHaveBeenCalledWith(createDto);
    });

    it('should throw NotFoundException when favorite product does not exist', async () => {
      const createDto: CreateCustomerDto = {
        name: 'John Doe',
        favoriteProductId: 999,
      };

      jest.spyOn(productVariantService, 'findOne').mockResolvedValue(null);

      await expect(service.create(createDto)).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.create(createDto)).rejects.toThrow(
        'Product variant with id 999 was not found',
      );
    });
  });

  describe('findAll', () => {
    const mockCustomers: Customer[] = [mockCustomer as Customer];

    it('should return all customers without filters', async () => {
      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        withDeleted: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue(mockCustomers),
      };

      jest.spyOn(customerRepository, 'createQueryBuilder').mockReturnValue(mockQueryBuilder as any);

      const result = await service.findAll();

      expect(result).toEqual(mockCustomers);
      expect(customerRepository.createQueryBuilder).toHaveBeenCalledWith('customer');
    });

    it('should filter customers by name', async () => {
      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        withDeleted: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue(mockCustomers),
      };

      jest.spyOn(customerRepository, 'createQueryBuilder').mockReturnValue(mockQueryBuilder as any);

      await service.findAll({ name: 'John' });

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'customer.name LIKE :name',
        { name: '%John%' },
      );
    });

    it('should filter customers by email', async () => {
      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        withDeleted: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue(mockCustomers),
      };

      jest.spyOn(customerRepository, 'createQueryBuilder').mockReturnValue(mockQueryBuilder as any);

      await service.findAll({ email: 'john@example.com' });

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'customer.email LIKE :email',
        { email: '%john@example.com%' },
      );
    });

    it('should return only deleted customers', async () => {
      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        withDeleted: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue(mockCustomers),
      };

      jest.spyOn(customerRepository, 'createQueryBuilder').mockReturnValue(mockQueryBuilder as any);

      await service.findAll({ onlyDeleted: true });

      expect(mockQueryBuilder.withDeleted).toHaveBeenCalled();
      expect(mockQueryBuilder.where).toHaveBeenCalledWith('customer.deleted_at IS NOT NULL');
    });

    it('should return customers with deleted included', async () => {
      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        withDeleted: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue(mockCustomers),
      };

      jest.spyOn(customerRepository, 'createQueryBuilder').mockReturnValue(mockQueryBuilder as any);

      await service.findAll({ withDeleted: true });

      expect(mockQueryBuilder.withDeleted).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a customer by ID', async () => {
      jest.spyOn(customerRepository, 'findOne').mockResolvedValue(mockCustomer as Customer);

      const result = await service.findOne(1);

      expect(result).toEqual(mockCustomer);
      expect(customerRepository.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
    });

    it('should throw NotFoundException when customer not found', async () => {
      jest.spyOn(customerRepository, 'findOne').mockResolvedValue(null);

      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
      await expect(service.findOne(999)).rejects.toThrow(
        'Customer with ID 999 not found',
      );
    });
  });

  describe('update', () => {
    it('should update a customer successfully', async () => {
      const updateDto: UpdateCustomerDto = {
        name: 'Jane Doe',
        email: 'jane@example.com',
      };

      jest.spyOn(service, 'findOne').mockResolvedValue(mockCustomer as Customer);
      jest.spyOn(customerRepository, 'update').mockResolvedValue({ affected: 1 } as any);
      jest.spyOn(service, 'findOne').mockResolvedValueOnce(mockCustomer as Customer).mockResolvedValue({ ...mockCustomer, ...updateDto } as Customer);

      const result = await service.update(1, updateDto);

      expect(result.name).toBe('Jane Doe');
      expect(customerRepository.update).toHaveBeenCalledWith(1, updateDto);
    });

    it('should validate favorite product if provided in update', async () => {
      const updateDto: UpdateCustomerDto = {
        favoriteProductId: 2,
      };

      jest.spyOn(productVariantService, 'findOne').mockResolvedValue(mockProductVariant as any);
      jest.spyOn(service, 'findOne').mockResolvedValue(mockCustomer as Customer);
      jest.spyOn(customerRepository, 'update').mockResolvedValue({ affected: 1 } as any);
      jest.spyOn(service, 'findOne').mockResolvedValueOnce(mockCustomer as Customer).mockResolvedValue({ ...mockCustomer, ...updateDto } as Customer);

      await service.update(1, updateDto);

      expect(productVariantService.findOne).toHaveBeenCalledWith(2);
    });

    it('should throw NotFoundException when updating non-existent customer', async () => {
      const updateDto: UpdateCustomerDto = { name: 'Jane Doe' };

      jest.spyOn(service, 'findOne').mockRejectedValue(new NotFoundException('Customer with ID 999 not found'));

      await expect(service.update(999, updateDto)).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should soft remove a customer', async () => {
      jest.spyOn(service, 'findOne').mockResolvedValue(mockCustomer as Customer);
      jest.spyOn(customerRepository, 'softRemove').mockResolvedValue(mockCustomer as Customer);

      await service.remove(1);

      expect(service.findOne).toHaveBeenCalledWith(1);
      expect(customerRepository.softRemove).toHaveBeenCalledWith(mockCustomer);
    });

    it('should throw NotFoundException when removing non-existent customer', async () => {
      jest.spyOn(service, 'findOne').mockRejectedValue(new NotFoundException('Customer with ID 999 not found'));

      await expect(service.remove(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('recover', () => {
    it('should recover a soft-deleted customer', async () => {
      const deletedCustomer = { ...mockCustomer, deleted_at: new Date() };

      jest.spyOn(customerRepository, 'findOne').mockResolvedValue(deletedCustomer as Customer);
      jest.spyOn(customerRepository, 'recover').mockResolvedValue(deletedCustomer as Customer);

      await service.recover(1);

      expect(customerRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
        withDeleted: true,
      });
      expect(customerRepository.recover).toHaveBeenCalledWith(deletedCustomer);
    });

    it('should throw NotFoundException when recovering non-existent customer', async () => {
      jest.spyOn(customerRepository, 'findOne').mockResolvedValue(null);

      await expect(service.recover(999)).rejects.toThrow(NotFoundException);
    });
  });
});
