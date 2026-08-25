import { Injectable } from '@nestjs/common';
import { AbstractValidation, ValidationResult } from './abstract-validation';
import { ValidationFactory, ValidationType } from './validation-factory';

@Injectable()
export class ValidationService {
  constructor(private readonly validationFactory: ValidationFactory) {}

  async execute(
    validationTypes: ValidationType[],
    data: any,
  ): Promise<ValidationResult> {
    if (validationTypes.length === 0) {
      return { isValid: true };
    }

    // Create the chain of validations
    const validations: AbstractValidation[] = [];
    
    for (const type of validationTypes) {
      const validation = this.validationFactory.create(type);
      validations.push(validation);
    }

    // Link the chain
    for (let i = 0; i < validations.length - 1; i++) {
      validations[i].setNext(validations[i + 1]);
    }

    // Execute the chain
    return validations[0].handle(data);
  }
}
