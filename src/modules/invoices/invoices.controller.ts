import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Query,
  ParseIntPipe,
  ParseEnumPipe,
  UseGuards,
  Body,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery, ApiBody } from '@nestjs/swagger';
import { InvoicesService } from './invoices.service';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { InvoiceType } from '../../entities/enums';

@ApiTags('invoices')
@Controller('invoices')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class InvoicesController {
  constructor(private readonly invoicesService: InvoicesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new invoice' })
  @ApiBody({ type: CreateInvoiceDto })
  create(@Body() createInvoiceDto: CreateInvoiceDto, @JwtAuthGuard() user: any) {
    return this.invoicesService.create(createInvoiceDto, user.userId);
  }

  @Get()
  @ApiOperation({ summary: 'Find all invoices' })
  @ApiQuery({ name: 'startDate', required: false, type: String })
  @ApiQuery({ name: 'endDate', required: false, type: String })
  @ApiQuery({ name: 'customerId', required: false, type: Number })
  @ApiQuery({ name: 'type', required: false, enum: InvoiceType })
  @ApiQuery({ name: 'onlyDeleted', required: false, type: Boolean })
  @ApiQuery({ name: 'withDeleted', required: false, type: Boolean })
  findAll(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('customerId', ParseIntPipe) customerId?: number,
    @Query('type', new ParseEnumPipe(InvoiceType)) type?: InvoiceType,
    @Query('onlyDeleted') onlyDeleted?: boolean,
    @Query('withDeleted') withDeleted?: boolean,
  ) {
    return this.invoicesService.findAll({
      startDate,
      endDate,
      customerId,
      type,
      onlyDeleted: onlyDeleted === 'true',
      withDeleted: withDeleted === 'true',
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Find one invoice by ID' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.invoicesService.findOne(id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Soft delete an invoice' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.invoicesService.remove(id);
  }

  @Post(':id/recover')
  @ApiOperation({ summary: 'Recover a soft-deleted invoice' })
  recover(@Param('id', ParseIntPipe) id: number) {
    return this.invoicesService.recover(id);
  }
}
