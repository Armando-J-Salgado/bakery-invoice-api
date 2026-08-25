import { Injectable } from '@nestjs/common';

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

export abstract class AbstractValidation {
  protected next: AbstractValidation | null = null;

  setNext(validation: AbstractValidation): AbstractValidation {
    this.next = validation;
    return validation;
  }

  abstract validate(data: any): Promise<ValidationResult>;

  async handle(data: any): Promise<ValidationResult> {
    const result = await this.validate(data);
    if (!result.isValid) {
      return result;
    }
    if (this.next) {
      return this.next.handle(data);
    }
    return { isValid: true };
  }
}
