import { Injectable } from '@nestjs/common';
import { AbstractValidation, ValidationResult } from './abstract-validation';

export type ValidationType =
  | 'productVariantExists'
  | 'quantityPositive'
  | 'customerExists'
  | 'customerNullContado'
  | 'paymentMethodValid'
  | 'invoiceTypeValid';

@Injectable()
export class ValidationFactory {
  private validationsMap = new Map<ValidationType, any>();

  register(type: ValidationType, validationClass: any) {
    this.validationsMap.set(type, validationClass);
  }

  create(type: ValidationType, ...args: any[]): AbstractValidation {
    const validationClass = this.validationsMap.get(type);
    if (!validationClass) {
      throw new Error(`Validation type "${type}" not registered`);
    }
    return new validationClass(...args);
  }

  getRegisteredTypes(): ValidationType[] {
    return Array.from(this.validationsMap.keys());
  }
}
