import { Module, Global } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ValidationFactory } from './validation-factory';
import { ValidationService } from './validation-service';
import { ProductVariantExistsValidation } from './validations/product-variant-exists.validation';
import { QuantityPositiveValidation } from './validations/quantity-positive.validation';
import { CustomerExistsValidation } from './validations/customer-exists.validation';
import { CustomerNullContadoValidation } from './validations/customer-null-contado.validation';
import { PaymentMethodValidValidation } from './validations/payment-method-valid.validation';
import { InvoiceTypeValidValidation } from './validations/invoice-type-valid.validation';
import { ProductVariant } from '../../entities/product-variant.entity';
import { Customer } from '../../entities/customer.entity';

@Global()
@Module({
  imports: [
    TypeOrmModule.forFeature([ProductVariant, Customer]),
  ],
  providers: [
    ValidationFactory,
    ValidationService,
    ProductVariantExistsValidation,
    QuantityPositiveValidation,
    CustomerExistsValidation,
    CustomerNullContadoValidation,
    PaymentMethodValidValidation,
    InvoiceTypeValidValidation,
  ],
  exports: [
    ValidationService,
    ValidationFactory,
  ],
})
export class ValidationsModule {}
