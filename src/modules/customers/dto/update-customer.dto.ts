import { PartialType, ApiPropertyOptional } from '@nestjs/swagger';
import { CreateCustomerDto } from './create-customer.dto';

export class UpdateCustomerDto extends PartialType(CreateCustomerDto) {
  @ApiPropertyOptional({
    description: 'Customer full name',
    example: 'Jane Doe',
  })
  name?: string;

  @ApiPropertyOptional({
    description: 'Customer address',
    example: '456 Oak Avenue, City, Country',
  })
  address?: string;

  @ApiPropertyOptional({
    description: 'Customer phone number',
    example: '+0987654321',
  })
  phoneNumber?: string;

  @ApiPropertyOptional({
    description: 'Customer email address',
    example: 'jane.doe@example.com',
  })
  email?: string;

  @ApiPropertyOptional({
    description: 'ID of the customer favorite product variant',
    example: 2,
  })
  favoriteProductId?: number;
}
