import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { IsNull, Like, Not, Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import { ProductsService } from '../../../src/modules/products/products.service';
import { Product } from '../../../src/entities/product.entity';
import { CreateProductDto } from '../../../src/modules/products/dto/create-product.dto';
import { UpdateProductDto } from '../../../src/modules/products/dto/update-product.dto';

describe('ProductsService - Unit Tests', () => {
  let service: ProductsService;
  let productRepository: Repository<Product>;

  const mockProduct: Partial<Product> = {
    id: 1,
    name: 'Test Product',
    created_at: new Date(),
    updated_at: new Date(),
    deleted_at: null,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsService,
        {
          provide: getRepositoryToken(Product),
          useClass: Repository,
        },
      ],
    })
      .overrideProvider(getRepositoryToken(Product))
      .useValue({
        create: jest.fn(),
        save: jest.fn(),
        findOne: jest.fn(),
        find: jest.fn(),
        update: jest.fn(),
        softRemove: jest.fn(),
        recover: jest.fn(),
      })
      .compile();

    service = module.get<ProductsService>(ProductsService);
    productRepository = module.get<Repository<Product>>(getRepositoryToken(Product));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a product successfully', async () => {
      const createDto: CreateProductDto = {
        name: 'New Product',
      };

      jest.spyOn(productRepository, 'create').mockReturnValue(createDto as any);
      jest.spyOn(productRepository, 'save').mockResolvedValue(mockProduct as Product);

      const result = await service.create(createDto);

      expect(result).toEqual(mockProduct);
      expect(productRepository.create).toHaveBeenCalledWith(createDto);
      expect(productRepository.save).toHaveBeenCalledWith(createDto);
    });
  });

  describe('findAll', () => {
    const mockProducts: Product[] = [mockProduct as Product];

    it('should return all products without filters', async () => {
      jest.spyOn(productRepository, 'find').mockResolvedValue(mockProducts);

      const result = await service.findAll();

      expect(result).toEqual(mockProducts);

      expect(productRepository.find).toHaveBeenCalledWith({
        where: {},
        relations: {
          variants: true,
        },
        withDeleted: undefined,
      });
    });

    it('should filter products by name', async () => {
      jest.spyOn(productRepository, 'find').mockResolvedValue(mockProducts);

      await service.findAll({ name: 'Test' });

      expect(productRepository.find).toHaveBeenCalledWith({
        where: {
          name: Like('%Test%'),
        },
        relations: {
          variants: true,
        },
        withDeleted: undefined,
      });
    });

    it('should return only deleted products', async () => {
      jest.spyOn(productRepository, 'find').mockResolvedValue(mockProducts);

      await service.findAll({ onlyDeleted: true });

      expect(productRepository.find).toHaveBeenCalledWith({
        where: {
          deleted_at: Not(IsNull()),
        },
        relations: {
          variants: true,
        },
        withDeleted: true,
      });
    });

    it('should return products with deleted included', async () => {
  jest.spyOn(productRepository, 'find').mockResolvedValue(mockProducts);

  await service.findAll({ withDeleted: true });

  expect(productRepository.find).toHaveBeenCalledWith({
    where: {},
    relations: {
      variants: true,
    },
    withDeleted: true,
  });
});

  describe('findOne', () => {
    it('should return a product by ID', async () => {
      jest.spyOn(productRepository, 'findOne').mockResolvedValue(mockProduct as Product);

      const result = await service.findOne(1);

      expect(result).toEqual(mockProduct);
      expect(productRepository.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
    });

    it('should throw NotFoundException when product not found', async () => {
      jest.spyOn(productRepository, 'findOne').mockResolvedValue(null);

      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
      await expect(service.findOne(999)).rejects.toThrow(
        'Product with ID 999 not found',
      );
    });
  });

  describe('update', () => {
    it('should update a product successfully', async () => {
      const updateDto: UpdateProductDto = {
        name: 'Updated Product',
      };

      jest.spyOn(service, 'findOne').mockResolvedValue(mockProduct as Product);
      jest.spyOn(productRepository, 'update').mockResolvedValue({ affected: 1 } as any);
      jest.spyOn(service, 'findOne')
        .mockResolvedValueOnce(mockProduct as Product)
        .mockResolvedValue({ ...mockProduct, ...updateDto } as Product);

      const result = await service.update(1, updateDto);

      expect(result.name).toBe('Updated Product');
      expect(productRepository.update).toHaveBeenCalledWith(1, updateDto);
    });

    it('should throw NotFoundException when updating non-existent product', async () => {
      const updateDto: UpdateProductDto = { name: 'Updated Product' };

      jest.spyOn(service, 'findOne').mockRejectedValue(new NotFoundException('Product with ID 999 not found'));

      await expect(service.update(999, updateDto)).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should soft remove a product', async () => {
      jest.spyOn(service, 'findOne').mockResolvedValue(mockProduct as Product);
      jest.spyOn(productRepository, 'softRemove').mockResolvedValue(mockProduct as Product);

      await service.remove(1);

      expect(service.findOne).toHaveBeenCalledWith(1);
      expect(productRepository.softRemove).toHaveBeenCalledWith(mockProduct);
    });

    it('should throw NotFoundException when removing non-existent product', async () => {
      jest.spyOn(service, 'findOne').mockRejectedValue(new NotFoundException('Product with ID 999 not found'));

      await expect(service.remove(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('recover', () => {
    it('should recover a soft-deleted product', async () => {
      const deletedProduct = { ...mockProduct, deleted_at: new Date() };

      jest.spyOn(productRepository, 'findOne').mockResolvedValue(deletedProduct as Product);
      jest.spyOn(productRepository, 'recover').mockResolvedValue(deletedProduct as Product);

      await service.recover(1);

      expect(productRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
        withDeleted: true,
      });
      expect(productRepository.recover).toHaveBeenCalledWith(deletedProduct);
    });

    it('should throw NotFoundException when recovering non-existent product', async () => {
      jest.spyOn(productRepository, 'findOne').mockResolvedValue(null);

      await expect(service.recover(999)).rejects.toThrow(NotFoundException);
    });
  });
});
});