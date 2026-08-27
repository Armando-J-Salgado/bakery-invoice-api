import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateProductDto {
  @ApiProperty({
    description: 'Product name',
    example: 'Chocolate Cake',
  })
  @IsNotEmpty()
  @IsString()
  name: string;
}
