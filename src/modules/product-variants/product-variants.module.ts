import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductVariantsService } from './product-variants.service';
import { ProductVariantsController } from './product-variants.controller';
import { ProductVariant } from '../../entities/product-variant.entity';
import { Product } from 'src/entities/product.entity';
import { ProductsService } from '../products/products.service';

@Module({
  imports: [TypeOrmModule.forFeature([ProductVariant, Product])],
  providers: [ProductVariantsService, ProductsService],
  controllers: [ProductVariantsController],
  exports: [ProductVariantsService],
})
export class ProductVariantsModule {}
