import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CustomersService } from './customers.service';
import { CustomersController } from './customers.controller';
import { Customer } from '../../entities/customer.entity';
import { ProductVariantsService } from '../product-variants/product-variants.service';
import { ProductVariant } from 'src/entities/product-variant.entity';
import { ProductsService } from '../products/products.service';
import { Product } from 'src/entities/product.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Customer, ProductVariant, Product])],
  providers: [CustomersService, ProductVariantsService, ProductsService],
  controllers: [CustomersController],
  exports: [CustomersService],
})
export class CustomersModule {}
