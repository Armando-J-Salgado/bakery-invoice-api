import { Injectable, Type } from '@nestjs/common';
import { AbstractValidation } from './abstract-validation';
import { ProductVariantExistsValidation } from './validations/product-variant-exists.validation';
import { CustomerExistsValidation } from './validations/customer-exists.validation';
import { CustomerNullContadoValidation } from './validations/customer-null-contado.validation';
import { InvoiceTypeValidValidation } from './validations/invoice-type-valid.validation';
import { PaymentMethodValidValidation } from './validations/payment-method-valid.validation';
import { QuantityPositiveValidation } from './validations/quantity-positive.validation';
import { ModuleRef } from '@nestjs/core';

export type ValidationType =
  | 'productVariantExists'
  | 'quantityPositive'
  | 'customerExists'
  | 'customerNullContado'
  | 'paymentMethodValid'
  | 'invoiceTypeValid';

@Injectable()
export class ValidationFactory {
  private readonly validationsMap = new Map<
    ValidationType,
    Type<AbstractValidation>
  >([
    ['customerExists', CustomerExistsValidation],
    ['customerNullContado', CustomerNullContadoValidation],
    ['invoiceTypeValid', InvoiceTypeValidValidation],
    ['paymentMethodValid', PaymentMethodValidValidation],
    ['productVariantExists', ProductVariantExistsValidation],
    ['quantityPositive', QuantityPositiveValidation],
  ]);

  constructor(private readonly moduleRef: ModuleRef) {}

  async create(type: ValidationType): Promise<AbstractValidation> {
    const validationClass = this.validationsMap.get(type);
    if (!validationClass) {
      throw new Error(`Validation type "${type}" not registered`);
    }
    return this.moduleRef.resolve(validationClass);
  }

  getRegisteredTypes(): ValidationType[] {
    return Array.from(this.validationsMap.keys());
  }
}
