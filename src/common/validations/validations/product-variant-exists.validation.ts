import { Injectable } from '@nestjs/common';
import { AbstractValidation, ValidationResult } from '../abstract-validation';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProductVariant } from '../../../entities/product-variant.entity';

@Injectable()
export class ProductVariantExistsValidation extends AbstractValidation {
  constructor(
    @InjectRepository(ProductVariant)
    private readonly productVariantRepository: Repository<ProductVariant>,
  ) {
    super();
  }

  async validate(data: any): Promise<ValidationResult> {
    const { sales } = data;

    if (!sales || !Array.isArray(sales)) {
      return { isValid: false, error: 'Sales array is required' };
    }

    for (const sale of sales) {
      const variant = await this.productVariantRepository.findOne({
        where: { id: sale.productVariantId },
      });

      if (!variant) {
        return {
          isValid: false,
          error: `Product variant with ID ${sale.productVariantId} does not exist`,
        };
      }
    }

    return { isValid: true };
  }
}
