import { IsIn, IsInt, IsOptional, ValidateNested, IsArray, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PaymentMethod, InvoiceType } from '../../../entities/enums';

export class CreateSaleItemDto {
  @ApiProperty({ description: 'Product variant ID' })
  @IsInt()
  productVariantId: number;

  @ApiProperty({ description: 'Quantity of the product', minimum: 1 })
  @Min(1)
  @IsInt()
  quantity: number;
}

export class CreateInvoiceDto {
  @ApiProperty({ enum: PaymentMethod, description: 'Payment method' })
  @IsIn(Object.values(PaymentMethod))
  paymentMethod: PaymentMethod;

  @ApiProperty({ enum: InvoiceType, description: 'Invoice type' })
  @IsIn(Object.values(InvoiceType))
  type: InvoiceType;

  @ApiPropertyOptional({ description: 'Customer ID (required for FACTURA, null/omitted for CONTADO)' })
  @IsInt()
  @IsOptional()
  customerId?: number;

  @ApiProperty({ type: [CreateSaleItemDto], description: 'List of sales items' })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateSaleItemDto)
  sales: CreateSaleItemDto[];
}
