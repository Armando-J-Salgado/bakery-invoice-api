import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import { ProductVariantsService } from '../../../src/modules/product-variants/product-variants.service';
import { ProductVariant } from '../../../src/entities/product-variant.entity';
import { ProductsService } from '../../../src/modules/products/products.service';
import { CreateProductVariantDto } from '../../../src/modules/product-variants/dto/create-product-variant.dto';
import { UpdateProductVariantDto } from '../../../src/modules/product-variants/dto/update-product-variant.dto';

describe('ProductVariantsService - Unit Tests', () => {
  let service: ProductVariantsService;
  let productVariantRepository: Repository<ProductVariant>;
  let productService: ProductsService;

  const mockProduct = {
    id: 1,
    name: 'Test Product',
    description: 'Test Description',
  };

  const mockProductVariant: Partial<ProductVariant> = {
    id: 1,
    productId: 1,
    name: 'Test Variant',
    price: 100,
    stock: 50,
    created_at: new Date(),
    updated_at: new Date(),
    deleted_at: null,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductVariantsService,
        {
          provide: getRepositoryToken(ProductVariant),
          useClass: Repository,
        },
        {
          provide: ProductsService,
          useValue: {
            findOne: jest.fn(),
          },
        },
      ],
    })
      .overrideProvider(getRepositoryToken(ProductVariant))
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

    service = module.get<ProductVariantsService>(ProductVariantsService);
    productVariantRepository = module.get<Repository<ProductVariant>>(getRepositoryToken(ProductVariant));
    productService = module.get<ProductsService>(ProductsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a product variant successfully', async () => {
      const createDto: CreateProductVariantDto = {
        productId: 1,
        name: 'New Variant',
        price: 100,
        stock: 50,
      };

      jest.spyOn(productService, 'findOne').mockResolvedValue(mockProduct as any);
      jest.spyOn(productVariantRepository, 'create').mockReturnValue(createDto as any);
      jest.spyOn(productVariantRepository, 'save').mockResolvedValue(mockProductVariant as ProductVariant);

      const result = await service.create(createDto);

      expect(result).toEqual(mockProductVariant);
      expect(productService.findOne).toHaveBeenCalledWith(1);
      expect(productVariantRepository.create).toHaveBeenCalledWith(createDto);
    });

    it('should throw NotFoundException when product does not exist', async () => {
      const createDto: CreateProductVariantDto = {
        productId: 999,
        name: 'Invalid Variant',
        price: 100,
        stock: 50,
      };

      jest.spyOn(productService, 'findOne').mockRejectedValue(new NotFoundException('Product with ID 999 not found'));

      await expect(service.create(createDto)).rejects.toThrow(NotFoundException);
    });
  });

  describe('findAll', () => {
    const mockVariants: ProductVariant[] = [mockProductVariant as ProductVariant];

    it('should return all product variants without filters', async () => {
      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        withDeleted: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue(mockVariants),
      };

      jest.spyOn(productVariantRepository, 'createQueryBuilder').mockReturnValue(mockQueryBuilder as any);

      const result = await service.findAll();

      expect(result).toEqual(mockVariants);
      expect(productVariantRepository.createQueryBuilder).toHaveBeenCalledWith('variant');
    });

    it('should filter variants by name', async () => {
      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        withDeleted: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue(mockVariants),
      };

      jest.spyOn(productVariantRepository, 'createQueryBuilder').mockReturnValue(mockQueryBuilder as any);

      await service.findAll({ name: 'Test' });

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'variant.name LIKE :name',
        { name: '%Test%' },
      );
    });

    it('should return only deleted variants', async () => {
      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        withDeleted: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue(mockVariants),
      };

      jest.spyOn(productVariantRepository, 'createQueryBuilder').mockReturnValue(mockQueryBuilder as any);

      await service.findAll({ onlyDeleted: true });

      expect(mockQueryBuilder.withDeleted).toHaveBeenCalled();
      expect(mockQueryBuilder.where).toHaveBeenCalledWith('variant.deleted_at IS NOT NULL');
    });

    it('should return variants with deleted included', async () => {
      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        withDeleted: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue(mockVariants),
      };

      jest.spyOn(productVariantRepository, 'createQueryBuilder').mockReturnValue(mockQueryBuilder as any);

      await service.findAll({ withDeleted: true });

      expect(mockQueryBuilder.withDeleted).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a product variant by ID', async () => {
      jest.spyOn(productVariantRepository, 'findOne').mockResolvedValue(mockProductVariant as ProductVariant);

      const result = await service.findOne(1);

      expect(result).toEqual(mockProductVariant);
      expect(productVariantRepository.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
    });

    it('should throw NotFoundException when variant not found', async () => {
      jest.spyOn(productVariantRepository, 'findOne').mockResolvedValue(null);

      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
      await expect(service.findOne(999)).rejects.toThrow(
        'ProductVariant with ID 999 not found',
      );
    });
  });

  describe('update', () => {
    it('should update a product variant successfully', async () => {
      const updateDto: UpdateProductVariantDto = {
        name: 'Updated Variant',
        price: 150,
      };

      jest.spyOn(service, 'findOne').mockResolvedValue(mockProductVariant as ProductVariant);
      jest.spyOn(productVariantRepository, 'update').mockResolvedValue({ affected: 1 } as any);
      jest.spyOn(service, 'findOne')
        .mockResolvedValueOnce(mockProductVariant as ProductVariant)
        .mockResolvedValue({ ...mockProductVariant, ...updateDto } as ProductVariant);

      const result = await service.update(1, updateDto);

      expect(result.name).toBe('Updated Variant');
      expect(productVariantRepository.update).toHaveBeenCalledWith(1, updateDto);
    });

    it('should validate product if productId is provided in update', async () => {
      const updateDto: UpdateProductVariantDto = {
        productId: 2,
      };

      jest.spyOn(productService, 'findOne').mockResolvedValue(mockProduct as any);
      jest.spyOn(service, 'findOne').mockResolvedValue(mockProductVariant as ProductVariant);
      jest.spyOn(productVariantRepository, 'update').mockResolvedValue({ affected: 1 } as any);
      jest.spyOn(service, 'findOne')
        .mockResolvedValueOnce(mockProductVariant as ProductVariant)
        .mockResolvedValue({ ...mockProductVariant, ...updateDto } as ProductVariant);

      await service.update(1, updateDto);

      expect(productService.findOne).toHaveBeenCalledWith(2);
    });

    it('should throw NotFoundException when updating non-existent variant', async () => {
      const updateDto: UpdateProductVariantDto = { name: 'Updated Variant' };

      jest.spyOn(service, 'findOne').mockRejectedValue(new NotFoundException('ProductVariant with ID 999 not found'));

      await expect(service.update(999, updateDto)).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should soft remove a product variant', async () => {
      jest.spyOn(service, 'findOne').mockResolvedValue(mockProductVariant as ProductVariant);
      jest.spyOn(productVariantRepository, 'softRemove').mockResolvedValue(mockProductVariant as ProductVariant);

      await service.remove(1);

      expect(service.findOne).toHaveBeenCalledWith(1);
      expect(productVariantRepository.softRemove).toHaveBeenCalledWith(mockProductVariant);
    });

    it('should throw NotFoundException when removing non-existent variant', async () => {
      jest.spyOn(service, 'findOne').mockRejectedValue(new NotFoundException('ProductVariant with ID 999 not found'));

      await expect(service.remove(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('recover', () => {
    it('should recover a soft-deleted product variant', async () => {
      const deletedVariant = { ...mockProductVariant, deleted_at: new Date() };

      jest.spyOn(productVariantRepository, 'findOne').mockResolvedValue(deletedVariant as ProductVariant);
      jest.spyOn(productVariantRepository, 'recover').mockResolvedValue(deletedVariant as ProductVariant);

      await service.recover(1);

      expect(productVariantRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
        withDeleted: true,
      });
      expect(productVariantRepository.recover).toHaveBeenCalledWith(deletedVariant);
    });

    it('should throw NotFoundException when recovering non-existent variant', async () => {
      jest.spyOn(productVariantRepository, 'findOne').mockResolvedValue(null);

      await expect(service.recover(999)).rejects.toThrow(NotFoundException);
    });
  });
});
