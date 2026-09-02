import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { ProductVariant } from '../../entities/product-variant.entity';
import { CreateProductVariantDto } from './dto/create-product-variant.dto';
import { UpdateProductVariantDto } from './dto/update-product-variant.dto';
import { ProductsService } from '../products/products.service';

@Injectable()
export class ProductVariantsService {
  constructor(
    @InjectRepository(ProductVariant)
    private productVariantsRepository: Repository<ProductVariant>,
    private productService: ProductsService,
  ) {}

  async create(createDto: CreateProductVariantDto): Promise<ProductVariant> {
    await this.productService.findOne(createDto.productId);
    const variant = this.productVariantsRepository.create(createDto);
    return this.productVariantsRepository.save(variant);
  }

  async findAll(params?: {
    name?: string;
    onlyDeleted?: boolean;
    withDeleted?: boolean;
  }): Promise<ProductVariant[]> {
    let query = this.productVariantsRepository.createQueryBuilder('variant');

    if (params?.onlyDeleted) {
      query.withDeleted().where('variant.deleted_at IS NOT NULL');
    } else if (params?.withDeleted) {
      query.withDeleted();
    }

    if (params?.name) {
      query.andWhere('variant.name LIKE :name', { name: `%${params.name}%` });
    }

    return query.getMany();
  }

  async findOne(id: number): Promise<ProductVariant> {
    const variant = await this.productVariantsRepository.findOne({
      where: { id },
    });
    if (!variant) {
      throw new NotFoundException(`ProductVariant with ID ${id} not found`);
    }
    return variant;
  }

  async update(
    id: number,
    updateDto: UpdateProductVariantDto,
  ): Promise<ProductVariant> {
    await this.findOne(id);
    if (updateDto.productId != null) {
      await this.productService.findOne(updateDto.productId);
    }
    await this.productVariantsRepository.update(id, updateDto);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    const variant = await this.findOne(id);
    await this.productVariantsRepository.softRemove(variant);
  }

  async recover(id: number): Promise<void> {
    const variant = await this.productVariantsRepository.findOne({
      where: { id },
      withDeleted: true,
    });
    if (!variant) {
      throw new NotFoundException(`ProductVariant with ID ${id} not found`);
    }
    await this.productVariantsRepository.recover(variant);
  }
}
