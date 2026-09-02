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
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { CustomersService } from './customers.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';

@ApiTags('Customers')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
@Controller('customers')
export class CustomersController {
  constructor(private readonly service: CustomersService) {}

  @Post()
  @ApiOperation({
    summary: 'Create a customer',
    description: 'Create a new customer with the provided information',
  })
  @ApiResponse({
    status: 201,
    description: 'Customer created successfully',
    schema: {
      example: {
        id: 1,
        name: 'John Doe',
        address: '123 Main Street',
        phoneNumber: '+1234567890',
        email: 'john@example.com',
        favoriteProductId: 1,
        created_at: '2024-01-15T10:00:00.000Z',
        updated_at: '2024-01-15T10:00:00.000Z',
        deleted_at: null,
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Validation error',
    schema: {
      example: {
        message: ['name must be a string', 'email must be an email'],
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
  create(@Body() createDto: CreateCustomerDto) {
    return this.service.create(createDto);
  }

  @Get()
  @ApiOperation({
    summary: 'Find all customers',
    description: 'Retrieve a list of customers with optional filtering',
  })
  @ApiQuery({
    name: 'name',
    required: false,
    description: 'Filter by customer name',
    example: 'John',
  })
  @ApiQuery({
    name: 'email',
    required: false,
    description: 'Filter by customer email',
    example: 'john@example.com',
  })
  @ApiQuery({
    name: 'onlyDeleted',
    required: false,
    description: 'Filter to show only deleted customers',
    example: false,
  })
  @ApiQuery({
    name: 'withDeleted',
    required: false,
    description: 'Include deleted customers in results',
    example: false,
  })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved customers list',
    schema: {
      example: [
        {
          id: 1,
          name: 'John Doe',
          address: '123 Main Street',
          phoneNumber: '+1234567890',
          email: 'john@example.com',
          favoriteProductId: 1,
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
    @Query('name') name?: string,
    @Query('email') email?: string,
    @Query('onlyDeleted') onlyDeleted?: string,
    @Query('withDeleted') withDeleted?: string,
  ) {
    return this.service.findAll({
      name,
      email,
      onlyDeleted: onlyDeleted === 'true',
      withDeleted: withDeleted === 'true',
    });
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Find one customer',
    description: 'Retrieve a single customer by ID',
  })
  @ApiResponse({
    status: 200,
    description: 'Customer found',
    schema: {
      example: {
        id: 1,
        name: 'John Doe',
        address: '123 Main Street',
        phoneNumber: '+1234567890',
        email: 'john@example.com',
        favoriteProductId: 1,
        created_at: '2024-01-15T10:00:00.000Z',
        updated_at: '2024-01-15T10:00:00.000Z',
        deleted_at: null,
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Customer not found',
    schema: {
      example: {
        message: 'Customer not found',
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
    return this.service.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Update a customer',
    description: 'Update an existing customer with the provided information',
  })
  @ApiResponse({
    status: 200,
    description: 'Customer updated successfully',
    schema: {
      example: {
        id: 1,
        name: 'Jane Doe',
        address: '456 Oak Avenue',
        phoneNumber: '+0987654321',
        email: 'jane@example.com',
        favoriteProductId: 2,
        created_at: '2024-01-15T10:00:00.000Z',
        updated_at: '2024-01-16T10:00:00.000Z',
        deleted_at: null,
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Validation error',
    schema: {
      example: {
        message: ['email must be an email'],
        error: 'Bad Request',
        statusCode: 400,
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Customer not found',
    schema: {
      example: {
        message: 'Customer not found',
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
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateCustomerDto,
  ) {
    return this.service.update(id, updateDto);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Soft delete a customer',
    description: 'Mark a customer as deleted (soft delete)',
  })
  @ApiResponse({
    status: 200,
    description: 'Customer soft deleted successfully',
    schema: { example: { message: 'Customer deleted successfully' } },
  })
  @ApiResponse({
    status: 404,
    description: 'Customer not found',
    schema: {
      example: {
        message: 'Customer not found',
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
    return this.service.remove(id);
  }

  @Post(':id/recover')
  @ApiOperation({
    summary: 'Recover a soft-deleted customer',
    description: 'Restore a previously soft-deleted customer',
  })
  @ApiResponse({
    status: 200,
    description: 'Customer recovered successfully',
    schema: { example: { message: 'Customer recovered successfully' } },
  })
  @ApiResponse({
    status: 404,
    description: 'Customer not found or not deleted',
    schema: {
      example: {
        message: 'Customer not found or not deleted',
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
    return this.service.recover(id);
  }
}
