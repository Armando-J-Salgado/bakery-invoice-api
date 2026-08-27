import { Injectable } from '@nestjs/common';
import { AbstractValidation, ValidationResult } from '../abstract-validation';
import { PaymentMethod } from '../../../entities/enums';

@Injectable()
export class PaymentMethodValidValidation extends AbstractValidation {
  async validate(data: any): Promise<ValidationResult> {
    const { paymentMethod } = data;
    
    const validMethods = Object.values(PaymentMethod);
    
    if (!paymentMethod || !validMethods.includes(paymentMethod)) {
      return { 
        isValid: false, 
        error: `Invalid payment method. Valid options are: ${validMethods.join(', ')}` 
      };
    }

    return { isValid: true };
  }
}
