import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ProductVariantsService } from './product-variants.service';
import { CreateProductVariantDto } from './dto/create-product-variant.dto';
import { UpdateProductVariantDto } from './dto/update-product-variant.dto';

@ApiTags('Product Variants')
@Controller('product-variants')
export class ProductVariantsController {
  constructor(private readonly service: ProductVariantsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a product variant' })
  create(@Body() createDto: CreateProductVariantDto) {
    return this.service.create(createDto);
  }

  @Get()
  @ApiOperation({ summary: 'Find all product variants' })
  findAll(
    @Query('name') name?: string,
    @Query('onlyDeleted') onlyDeleted?: boolean,
    @Query('withDeleted') withDeleted?: boolean,
  ) {
    return this.service.findAll({
      name,
      onlyDeleted: onlyDeleted === 'true',
      withDeleted: withDeleted === 'true',
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Find one product variant' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a product variant' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateProductVariantDto,
  ) {
    return this.service.update(id, updateDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Soft delete a product variant' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }

  @Post(':id/recover')
  @ApiOperation({ summary: 'Recover a soft-deleted product variant' })
  recover(@Param('id', ParseIntPipe) id: number) {
    return this.service.recover(id);
  }
}
