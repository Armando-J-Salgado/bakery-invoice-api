import 'dotenv/config';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { databaseConfig } from './config/database.config';
import { ProductsModule } from './modules/products/products.module';
import { ProductVariantsModule } from './modules/product-variants/product-variants.module';
import { CustomersModule } from './modules/customers/customers.module';
import { InvoicesModule } from './modules/invoices/invoices.module';
import { AuthModule } from './modules/auth/auth.module';
import { ValidationsModule } from './common/validations/validations.module';

@Module({
  imports: [
    TypeOrmModule.forRoot(databaseConfig),
    AuthModule,
    ProductsModule,
    ProductVariantsModule,
    CustomersModule,
    InvoicesModule,
    ValidationsModule,
  ],
})
export class AppModule {}
