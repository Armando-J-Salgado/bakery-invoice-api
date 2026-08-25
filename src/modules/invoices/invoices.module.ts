import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InvoicesController } from './invoices.controller';
import { InvoicesService } from './invoices.service';
import { Invoice } from '../../entities/invoice.entity';
import { Sale } from '../../entities/sale.entity';
import { User } from '../../entities/user.entity';
import { ProductVariant } from '../../entities/product-variant.entity';
import { ValidationsModule } from '../../common/validations/validations.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Invoice, Sale, User, ProductVariant]),
    ValidationsModule,
  ],
  controllers: [InvoicesController],
  providers: [InvoicesService],
  exports: [InvoicesService],
})
export class InvoicesModule {}
