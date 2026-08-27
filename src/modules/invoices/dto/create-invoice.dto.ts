import { IsIn, IsInt, IsOptional, ValidateNested, IsArray, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PaymentMethod, InvoiceType } from '../../../entities/enums';

export class CreateSaleItemDto {
  @ApiProperty({ 
    description: 'Product variant ID',
    example: 1,
  })
  @IsInt()
  productVariantId: number;

  @ApiProperty({ 
    description: 'Quantity of the product',
    example: 5,
    minimum: 1,
  })
  @Min(1)
  @IsInt()
  quantity: number;
}

export class CreateInvoiceDto {
  @ApiProperty({ 
    enum: PaymentMethod, 
    description: 'Payment method for the invoice',
    example: PaymentMethod.CASH,
  })
  @IsIn(Object.values(PaymentMethod))
  paymentMethod: PaymentMethod;

  @ApiProperty({ 
    enum: InvoiceType, 
    description: 'Type of invoice (CONTADO for cash sale, FACTURA for credit sale)',
    example: InvoiceType.FACTURA,
  })
  @IsIn(Object.values(InvoiceType))
  type: InvoiceType;

  @ApiPropertyOptional({ 
    description: 'Customer ID (required for FACTURA type invoices, optional/null for CONTADO)',
    example: 1,
  })
  @IsInt()
  @IsOptional()
  customerId?: number;

  @ApiProperty({ 
    type: [CreateSaleItemDto], 
    description: 'List of sale items in the invoice',
    example: [{ productVariantId: 1, quantity: 5 }, { productVariantId: 2, quantity: 3 }],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateSaleItemDto)
  sales: CreateSaleItemDto[];
}
