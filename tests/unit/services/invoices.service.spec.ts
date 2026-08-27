import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { InvoicesService } from '../../../src/modules/invoices/invoices.service';
import { Invoice } from '../../../src/entities/invoice.entity';
import { Sale } from '../../../src/entities/sale.entity';
import { User } from '../../../src/entities/user.entity';
import { ProductVariant } from '../../../src/entities/product-variant.entity';
import { ValidationService } from '../../../src/common/validations/validation-service';
import { ValidationFactory } from '../../../src/common/validations/validation-factory';
import { CreateInvoiceDto } from '../../../src/modules/invoices/dto/create-invoice.dto';
import { PaymentMethod, InvoiceType } from '../../../src/entities/enums';

describe('InvoicesService - Unit Tests', () => {
  let service: InvoicesService;
  let invoiceRepository: Repository<Invoice>;
  let saleRepository: Repository<Sale>;
  let userRepository: Repository<User>;
  let productVariantRepository: Repository<ProductVariant>;
  let validationService: ValidationService;
  let validationFactory: ValidationFactory;

  const mockProductVariant = {
    id: 1,
    productId: 1,
    name: 'Test Variant',
    price: 100,
    stock: 50,
  };

  const mockUser = {
    id: 1,
    email: 'test@example.com',
    password: 'hashedPassword',
    role: 'admin',
  };

  const mockInvoice: Partial<Invoice> = {
    id: 1,
    total: 500,
    date: new Date(),
    customerId: 1,
    userId: 1,
    paymentMethod: PaymentMethod.CASH,
    type: InvoiceType.CONTADO,
    created_at: new Date(),
    updated_at: new Date(),
    deleted_at: null,
    sales: [],
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InvoicesService,
        {
          provide: getRepositoryToken(Invoice),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(Sale),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(User),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(ProductVariant),
          useClass: Repository,
        },
        {
          provide: ValidationService,
          useValue: {
            execute: jest.fn(),
          },
        },
        {
          provide: ValidationFactory,
          useValue: {},
        },
      ],
    })
      .overrideProvider(getRepositoryToken(Invoice))
      .useValue({
        create: jest.fn(),
        save: jest.fn(),
        findOne: jest.fn(),
        createQueryBuilder: jest.fn(),
        softRemove: jest.fn(),
        recover: jest.fn(),
      })
      .overrideProvider(getRepositoryToken(Sale))
      .useValue({
        create: jest.fn(),
        save: jest.fn(),
      })
      .overrideProvider(getRepositoryToken(User))
      .useValue({
        findOne: jest.fn(),
      })
      .overrideProvider(getRepositoryToken(ProductVariant))
      .useValue({
        findOne: jest.fn(),
      })
      .compile();

    service = module.get<InvoicesService>(InvoicesService);
    invoiceRepository = module.get<Repository<Invoice>>(getRepositoryToken(Invoice));
    saleRepository = module.get<Repository<Sale>>(getRepositoryToken(Sale));
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
    productVariantRepository = module.get<Repository<ProductVariant>>(
      getRepositoryToken(ProductVariant),
    );
    validationService = module.get<ValidationService>(ValidationService);
    validationFactory = module.get<ValidationFactory>(ValidationFactory);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const createDto: CreateInvoiceDto = {
      paymentMethod: PaymentMethod.CASH,
      type: InvoiceType.CONTADO,
      sales: [
        { productVariantId: 1, quantity: 5 },
      ],
    };

    it('should create an invoice successfully', async () => {
      jest.spyOn(validationService, 'execute').mockResolvedValue({ isValid: true });
      jest.spyOn(productVariantRepository, 'findOne').mockResolvedValue(mockProductVariant as ProductVariant);
      jest.spyOn(invoiceRepository, 'create').mockReturnValue(mockInvoice as Invoice);
      jest.spyOn(invoiceRepository, 'save').mockResolvedValue(mockInvoice as Invoice);
      jest.spyOn(saleRepository, 'create').mockReturnValue({} as Sale);
      jest.spyOn(saleRepository, 'save').mockResolvedValue([]);
      jest.spyOn(service, 'findOne').mockResolvedValue(mockInvoice as Invoice);

      const result = await service.create(createDto, 1);

      expect(result).toEqual(mockInvoice);
      expect(validationService.execute).toHaveBeenCalled();
      expect(invoiceRepository.create).toHaveBeenCalledWith(expect.objectContaining({
        total: 500,
        userId: 1,
        paymentMethod: PaymentMethod.CASH,
        type: InvoiceType.CONTADO,
      }));
    });

    it('should throw BadRequestException when validation fails', async () => {
      jest.spyOn(validationService, 'execute').mockResolvedValue({ 
        isValid: false, 
        error: 'Invalid product variant' 
      });

      await expect(service.create(createDto, 1)).rejects.toThrow(BadRequestException);
      await expect(service.create(createDto, 1)).rejects.toThrow('Invalid product variant');
    });

    it('should throw BadRequestException when product variant not found', async () => {
      jest.spyOn(validationService, 'execute').mockResolvedValue({ isValid: true });
      jest.spyOn(productVariantRepository, 'findOne').mockResolvedValue(null);

      await expect(service.create(createDto, 1)).rejects.toThrow(BadRequestException);
    });

    it('should calculate total correctly for multiple items', async () => {
      const multiItemDto: CreateInvoiceDto = {
        paymentMethod: PaymentMethod.CASH,
        type: InvoiceType.CONTADO,
        sales: [
          { productVariantId: 1, quantity: 5 },
          { productVariantId: 2, quantity: 3 },
        ],
      };

      const variant1 = { ...mockProductVariant, price: 100 };
      const variant2 = { ...mockProductVariant, id: 2, price: 200 };

      jest.spyOn(validationService, 'execute').mockResolvedValue({ isValid: true });
      jest.spyOn(productVariantRepository, 'findOne')
        .mockResolvedValueOnce(variant1 as ProductVariant)
        .mockResolvedValueOnce(variant2 as ProductVariant);
      jest.spyOn(invoiceRepository, 'create').mockReturnValue(mockInvoice as Invoice);
      jest.spyOn(invoiceRepository, 'save').mockResolvedValue(mockInvoice as Invoice);
      jest.spyOn(saleRepository, 'create').mockReturnValue({} as Sale);
      jest.spyOn(saleRepository, 'save').mockResolvedValue([]);
      jest.spyOn(service, 'findOne').mockResolvedValue(mockInvoice as Invoice);

      await service.create(multiItemDto, 1);

      expect(invoiceRepository.create).toHaveBeenCalledWith(expect.objectContaining({
        total: 1100, // 5*100 + 3*200
      }));
    });
  });

  describe('findAll', () => {
    const mockInvoices: Invoice[] = [mockInvoice as Invoice];

    it('should return all invoices without filters', async () => {
      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        withDeleted: jest.fn().mockReturnThis(),
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue(mockInvoices),
      };

      jest.spyOn(invoiceRepository, 'createQueryBuilder').mockReturnValue(mockQueryBuilder as any);

      const result = await service.findAll({});

      expect(result).toEqual(mockInvoices);
      expect(invoiceRepository.createQueryBuilder).toHaveBeenCalledWith('invoice');
    });

    it('should filter by date range', async () => {
      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        withDeleted: jest.fn().mockReturnThis(),
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue(mockInvoices),
      };

      jest.spyOn(invoiceRepository, 'createQueryBuilder').mockReturnValue(mockQueryBuilder as any);

      await service.findAll({
        startDate: '2024-01-01',
        endDate: '2024-12-31',
      });

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'invoice.date >= :startDate',
        { startDate: new Date('2024-01-01') },
      );
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'invoice.date <= :endDate',
        { endDate: new Date('2024-12-31') },
      );
    });

    it('should filter by customer ID', async () => {
      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        withDeleted: jest.fn().mockReturnThis(),
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue(mockInvoices),
      };

      jest.spyOn(invoiceRepository, 'createQueryBuilder').mockReturnValue(mockQueryBuilder as any);

      await service.findAll({ customerId: 5 });

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'invoice.customerId = :customerId',
        { customerId: 5 },
      );
    });

    it('should filter by invoice type', async () => {
      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        withDeleted: jest.fn().mockReturnThis(),
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue(mockInvoices),
      };

      jest.spyOn(invoiceRepository, 'createQueryBuilder').mockReturnValue(mockQueryBuilder as any);

      await service.findAll({ type: InvoiceType.FACTURA });

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'invoice.type = :type',
        { type: InvoiceType.FACTURA },
      );
    });

    it('should return only deleted invoices', async () => {
      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        withDeleted: jest.fn().mockReturnThis(),
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue(mockInvoices),
      };

      jest.spyOn(invoiceRepository, 'createQueryBuilder').mockReturnValue(mockQueryBuilder as any);

      await service.findAll({ onlyDeleted: true });

      expect(mockQueryBuilder.withDeleted).toHaveBeenCalled();
      expect(mockQueryBuilder.where).toHaveBeenCalledWith('invoice.deleted_at IS NOT NULL');
    });
  });

  describe('findOne', () => {
    it('should return an invoice by ID', async () => {
      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        withDeleted: jest.fn().mockReturnThis(),
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(mockInvoice),
      };

      jest.spyOn(invoiceRepository, 'createQueryBuilder').mockReturnValue(mockQueryBuilder as any);

      const result = await service.findOne(1);

      expect(result).toEqual(mockInvoice);
    });

    it('should throw NotFoundException when invoice not found', async () => {
      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        withDeleted: jest.fn().mockReturnThis(),
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(null),
      };

      jest.spyOn(invoiceRepository, 'createQueryBuilder').mockReturnValue(mockQueryBuilder as any);

      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
      await expect(service.findOne(999)).rejects.toThrow(
        'Invoice with ID 999 not found',
      );
    });

    it('should include deleted invoices when includeDeleted is true', async () => {
      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        withDeleted: jest.fn().mockReturnThis(),
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(mockInvoice),
      };

      jest.spyOn(invoiceRepository, 'createQueryBuilder').mockReturnValue(mockQueryBuilder as any);

      await service.findOne(1, true);

      expect(mockQueryBuilder.withDeleted).toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('should soft remove an invoice', async () => {
      jest.spyOn(service, 'findOne').mockResolvedValue(mockInvoice as Invoice);
      jest.spyOn(invoiceRepository, 'softRemove').mockResolvedValue(mockInvoice as Invoice);

      await service.remove(1);

      expect(service.findOne).toHaveBeenCalledWith(1);
      expect(invoiceRepository.softRemove).toHaveBeenCalledWith(mockInvoice);
    });

    it('should throw NotFoundException when removing non-existent invoice', async () => {
      jest.spyOn(service, 'findOne').mockRejectedValue(new NotFoundException('Invoice with ID 999 not found'));

      await expect(service.remove(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('recover', () => {
    it('should recover a soft-deleted invoice', async () => {
      const deletedInvoice = { ...mockInvoice, deleted_at: new Date() };

      jest.spyOn(service, 'findOne').mockResolvedValue(deletedInvoice as Invoice);
      jest.spyOn(invoiceRepository, 'recover').mockResolvedValue(deletedInvoice as Invoice);

      await service.recover(1);

      expect(invoiceRepository.recover).toHaveBeenCalledWith(deletedInvoice);
    });

    it('should throw BadRequestException when invoice is not deleted', async () => {
      jest.spyOn(service, 'findOne').mockResolvedValue(mockInvoice as Invoice);

      await expect(service.recover(1)).rejects.toThrow(BadRequestException);
      await expect(service.recover(1)).rejects.toThrow('Invoice is not deleted');
    });

    it('should throw NotFoundException when recovering non-existent invoice', async () => {
      jest.spyOn(service, 'findOne').mockRejectedValue(new NotFoundException('Invoice with ID 999 not found'));

      await expect(service.recover(999)).rejects.toThrow(NotFoundException);
    });
  });
});
