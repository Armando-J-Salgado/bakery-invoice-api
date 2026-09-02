import { Injectable } from '@nestjs/common';
import { AbstractValidation, ValidationResult } from '../abstract-validation';
import { InvoiceType } from '../../../entities/enums';

@Injectable()
export class InvoiceTypeValidValidation extends AbstractValidation {
  async validate(data: any): Promise<ValidationResult> {
    const { type } = data;

    const validTypes = Object.values(InvoiceType);

    if (!type || !validTypes.includes(type)) {
      return {
        isValid: false,
        error: `Invalid invoice type. Valid options are: ${validTypes.join(', ')}`,
      };
    }

    return { isValid: true };
  }
}
