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
  Req,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiQuery,
  ApiBody,
  ApiResponse,
} from '@nestjs/swagger';
import { InvoicesService } from './invoices.service';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { InvoiceType } from '../../entities/enums';

@ApiTags('Invoices')
@Controller('invoices')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class InvoicesController {
  constructor(private readonly invoicesService: InvoicesService) {}

  @Post()
  @ApiOperation({
    summary: 'Create a new invoice',
    description:
      'Create a new invoice with sales items. Requires authentication.',
  })
  @ApiBody({ type: CreateInvoiceDto })
  @ApiResponse({
    status: 201,
    description: 'Invoice created successfully',
    schema: {
      example: {
        id: 1,
        total: 150.0,
        date: '2024-01-15T10:00:00.000Z',
        customerId: 1,
        userId: 1,
        paymentMethod: 'CASH',
        type: 'CONTADO',
        created_at: '2024-01-15T10:00:00.000Z',
        updated_at: '2024-01-15T10:00:00.000Z',
        deleted_at: null,
        sales: [{ id: 1, invoiceId: 1, productVariantId: 1, quantity: 5 }],
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Validation error',
    schema: {
      example: {
        message: [
          'paymentMethod must be one of the following values: CASH, NEQUI, TRANSFER',
        ],
        error: 'Bad Request',
        statusCode: 400,
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - User not authenticated',
    schema: {
      example: {
        message: 'Unauthorized',
        error: 'Unauthorized',
        statusCode: 401,
      },
    },
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - FACTURA invoice requires a customer',
    schema: {
      example: {
        message: 'Customer is required for FACTURA invoices',
        error: 'Forbidden',
        statusCode: 403,
      },
    },
  })
  create(@Body() createInvoiceDto: CreateInvoiceDto, @Req() req: any) {
    return this.invoicesService.create(createInvoiceDto, req.user.userId);
  }

  @Get()
  @ApiOperation({
    summary: 'Find all invoices',
    description: 'Retrieve a list of invoices with optional filtering',
  })
  @ApiQuery({
    name: 'startDate',
    required: false,
    description: 'Filter invoices by start date (ISO format)',
    example: '2024-01-01',
  })
  @ApiQuery({
    name: 'endDate',
    required: false,
    description: 'Filter invoices by end date (ISO format)',
    example: '2024-12-31',
  })
  @ApiQuery({
    name: 'customerId',
    required: false,
    description: 'Filter invoices by customer ID',
    example: 1,
  })
  @ApiQuery({
    name: 'type',
    required: false,
    description: 'Filter invoices by type',
    example: 'FACTURA',
    enum: InvoiceType,
  })
  @ApiQuery({
    name: 'onlyDeleted',
    required: false,
    description: 'Filter to show only deleted invoices',
    example: false,
  })
  @ApiQuery({
    name: 'withDeleted',
    required: false,
    description: 'Include deleted invoices in results',
    example: false,
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved invoices list',
    schema: {
      example: [
        {
          id: 1,
          total: 150.0,
          date: '2024-01-15T10:00:00.000Z',
          customerId: 1,
          userId: 1,
          paymentMethod: 'CASH',
          type: 'CONTADO',
          created_at: '2024-01-15T10:00:00.000Z',
          updated_at: '2024-01-15T10:00:00.000Z',
          deleted_at: null,
        },
      ],
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - User not authenticated',
    schema: {
      example: {
        message: 'Unauthorized',
        error: 'Unauthorized',
        statusCode: 401,
      },
    },
  })
  findAll(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('customerId', ParseIntPipe) customerId?: number,
    @Query('type', new ParseEnumPipe(InvoiceType)) type?: InvoiceType,
    @Query('onlyDeleted') onlyDeleted?: string,
    @Query('withDeleted') withDeleted?: string,
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
  @ApiOperation({
    summary: 'Find one invoice by ID',
    description: 'Retrieve a single invoice by its ID',
  })
  @ApiResponse({
    status: 200,
    description: 'Invoice found',
    schema: {
      example: {
        id: 1,
        total: 150.0,
        date: '2024-01-15T10:00:00.000Z',
        customerId: 1,
        userId: 1,
        paymentMethod: 'CASH',
        type: 'CONTADO',
        created_at: '2024-01-15T10:00:00.000Z',
        updated_at: '2024-01-15T10:00:00.000Z',
        deleted_at: null,
        sales: [{ id: 1, invoiceId: 1, productVariantId: 1, quantity: 5 }],
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Invoice not found',
    schema: {
      example: {
        message: 'Invoice not found',
        error: 'Not Found',
        statusCode: 404,
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - User not authenticated',
    schema: {
      example: {
        message: 'Unauthorized',
        error: 'Unauthorized',
        statusCode: 401,
      },
    },
  })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.invoicesService.findOne(id);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Soft delete an invoice',
    description: 'Mark an invoice as deleted (soft delete)',
  })
  @ApiResponse({
    status: 200,
    description: 'Invoice soft deleted successfully',
    schema: { example: { message: 'Invoice deleted successfully' } },
  })
  @ApiResponse({
    status: 404,
    description: 'Invoice not found',
    schema: {
      example: {
        message: 'Invoice not found',
        error: 'Not Found',
        statusCode: 404,
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - User not authenticated',
    schema: {
      example: {
        message: 'Unauthorized',
        error: 'Unauthorized',
        statusCode: 401,
      },
    },
  })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.invoicesService.remove(id);
  }

  @Post(':id/recover')
  @ApiOperation({
    summary: 'Recover a soft-deleted invoice',
    description: 'Restore a previously soft-deleted invoice',
  })
  @ApiResponse({
    status: 200,
    description: 'Invoice recovered successfully',
    schema: { example: { message: 'Invoice recovered successfully' } },
  })
  @ApiResponse({
    status: 404,
    description: 'Invoice not found or not deleted',
    schema: {
      example: {
        message: 'Invoice not found or not deleted',
        error: 'Not Found',
        statusCode: 404,
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - User not authenticated',
    schema: {
      example: {
        message: 'Unauthorized',
        error: 'Unauthorized',
        statusCode: 401,
      },
    },
  })
  recover(@Param('id', ParseIntPipe) id: number) {
    return this.invoicesService.recover(id);
  }
}
