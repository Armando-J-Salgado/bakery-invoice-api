import { Injectable } from '@nestjs/common';
import { AbstractValidation, ValidationResult } from '../abstract-validation';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Customer } from '../../entities/customer.entity';
import { InvoiceType } from '../../entities/enums';

@Injectable()
export class CustomerExistsValidation extends AbstractValidation {
  constructor(
    @InjectRepository(Customer)
    private readonly customerRepository: Repository<Customer>,
  ) {
    super();
  }

  async validate(data: any): Promise<ValidationResult> {
    const { type, customerId } = data;
    
    if (type !== InvoiceType.FACTURA) {
      return { isValid: true };
    }

    if (!customerId) {
      return { 
        isValid: false, 
        error: 'Customer ID is required for FACTURA type invoices' 
      };
    }

    const customer = await this.customerRepository.findOne({
      where: { id: customerId },
    });

    if (!customer) {
      return { 
        isValid: false, 
        error: `Customer with ID ${customerId} does not exist` 
      };
    }

    return { isValid: true };
  }
}
