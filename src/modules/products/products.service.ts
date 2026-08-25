import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, FindOptionsWhere } from 'typeorm';
import { Product } from '../../entities/product.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private productsRepository: Repository<Product>,
  ) {}

  async create(createProductDto: CreateProductDto): Promise<Product> {
    const product = this.productsRepository.create(createProductDto);
    return this.productsRepository.save(product);
  }

  async findAll(params?: {
    name?: string;
    startDate?: string;
    endDate?: string;
    onlyDeleted?: boolean;
    withDeleted?: boolean;
  }): Promise<Product[]> {
    const where: FindOptionsWhere<Product> = {};

    if (params?.name) {
      where.name = Like(`%${params.name}%`);
    }

    let query = this.productsRepository.createQueryBuilder('product');

    if (params?.onlyDeleted) {
      query.withDeleted().where('product.deleted_at IS NOT NULL');
    } else if (params?.withDeleted) {
      query.withDeleted();
    }

    if (params?.name) {
      query.andWhere('product.name LIKE :name', { name: `%${params.name}%` });
    }

    return query.getMany();
  }

  async findOne(id: number): Promise<Product> {
    const product = await this.productsRepository.findOne({ where: { id } });
    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }
    return product;
  }

  async update(id: number, updateProductDto: UpdateProductDto): Promise<Product> {
    await this.findOne(id);
    await this.productsRepository.update(id, updateProductDto);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    const product = await this.findOne(id);
    await this.productsRepository.softRemove(product);
  }

  async recover(id: number): Promise<void> {
    const product = await this.productsRepository.findOne({
      where: { id },
      withDeleted: true,
    });
    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }
    await this.productsRepository.recover(product);
  }
}
