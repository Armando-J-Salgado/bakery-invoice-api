import { Injectable } from '@nestjs/common';
import { AbstractValidation, ValidationResult } from '../abstract-validation';

@Injectable()
export class QuantityPositiveValidation extends AbstractValidation {
  async validate(data: any): Promise<ValidationResult> {
    const { sales } = data;

    if (!sales || !Array.isArray(sales)) {
      return { isValid: false, error: 'Sales array is required' };
    }

    for (const sale of sales) {
      if (!sale.quantity || sale.quantity <= 0) {
        return {
          isValid: false,
          error: `Quantity must be greater than 0 for product variant ${sale.productVariantId}`,
        };
      }
    }

    return { isValid: true };
  }
}
