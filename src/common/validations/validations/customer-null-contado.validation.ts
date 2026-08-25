import { Injectable } from '@nestjs/common';
import { AbstractValidation, ValidationResult } from '../abstract-validation';
import { InvoiceType } from '../../entities/enums';

@Injectable()
export class CustomerNullContadoValidation extends AbstractValidation {
  async validate(data: any): Promise<ValidationResult> {
    const { type, customerId } = data;
    
    if (type !== InvoiceType.CONTADO) {
      return { isValid: true };
    }

    if (customerId !== undefined && customerId !== null) {
      return { 
        isValid: false, 
        error: 'Customer ID must be null or not defined for CONTADO type invoices' 
      };
    }

    return { isValid: true };
  }
}
