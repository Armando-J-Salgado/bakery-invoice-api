# Bakery Invoice System - Implementation Plan

## Overview
This document outlines the implementation plan for a Bakery Invoice System API using NestJS, TypeORM, and JWT authentication.

## Architecture Principles
- **KISS (Keep It Simple, Stupid)**: Minimal complexity, straightforward implementations
- **YAGNI (You Ain't Gonna Need It)**: Only implement required features
- **TDD (Test Driven Development)**: Write tests before implementation

## Project Structure

```
src/
├── common/
│   ├── decorators/
│   │   └── public.decorator.ts
│   ├── filters/
│   │   └── http-exception.filter.ts
│   ├── guards/
│   │   └── jwt-auth.guard.ts
│   ├── interceptors/
│   │   └── transform.interceptor.ts
│   └── validations/
│       ├── abstract-validation.ts
│       ├── validation-factory.ts
│       └── validation-service.ts
│       └── validations/
│           ├── product-variant-exists.validation.ts
│           ├── quantity-positive.validation.ts
│           ├── customer-exists.validation.ts
│           ├── customer-null-contado.validation.ts
│           ├── payment-method-valid.validation.ts
│           └── invoice-type-valid.validation.ts
├── config/
│   └── database.config.ts
├── entities/
│   ├── base.entity.ts
│   ├── product.entity.ts
│   ├── product-variant.entity.ts
│   ├── customer.entity.ts
│   ├── invoice.entity.ts
│   ├── sale.entity.ts
│   └── user.entity.ts
├── modules/
│   ├── auth/
│   │   ├── auth.controller.ts
│   │   ├── auth.module.ts
│   │   ├── auth.service.ts
│   │   ├── dto/
│   │   │   ├── login.dto.ts
│   │   │   └── token.dto.ts
│   │   └── strategies/
│   │       └── jwt.strategy.ts
│   ├── products/
│   │   ├── products.controller.ts
│   │   ├── products.module.ts
│   │   ├── products.service.ts
│   │   ├── dto/
│   │   │   ├── create-product.dto.ts
│   │   │   └── update-product.dto.ts
│   │   └── entities/
│   │       └── product.entity.ts
│   ├── product-variants/
│   │   ├── product-variants.controller.ts
│   │   ├── product-variants.module.ts
│   │   ├── product-variants.service.ts
│   │   ├── dto/
│   │   │   ├── create-product-variant.dto.ts
│   │   │   └── update-product-variant.dto.ts
│   │   └── entities/
│   │       └── product-variant.entity.ts
│   ├── customers/
│   │   ├── customers.controller.ts
│   │   ├── customers.module.ts
│   │   ├── customers.service.ts
│   │   ├── dto/
│   │   │   ├── create-customer.dto.ts
│   │   │   └── update-customer.dto.ts
│   │   └── entities/
│   │       └── customer.entity.ts
│   ├── invoices/
│   │   ├── invoices.controller.ts
│   │   ├── invoices.module.ts
│   │   ├── invoices.service.ts
│   │   ├── dto/
│   │   │   ├── create-invoice.dto.ts
│   │   │   └── invoice-response.dto.ts
│   │   └── entities/
│   │       └── invoice.entity.ts
│   ├── sales/
│   │   ├── sales.module.ts
│   │   ├── sales.service.ts
│   │   └── entities/
│   │       └── sale.entity.ts
│   └── users/
│       ├── users.module.ts
│       ├── users.service.ts
│       ├── dto/
│       │   └── user.dto.ts
│       └── entities/
│           └── user.entity.ts
├── seeds/
│   ├── seeds.module.ts
│   └── seeds.service.ts
├── app.module.ts
└── main.ts
```

## Database Schema

### Entities with Soft Delete
All entities include: `id`, `created_at`, `updated_at`, `deleted_at`

1. **Product**: id, name
2. **ProductVariant**: id, name, price, product_id (FK)
3. **Customer**: id, name, address, phone_number, email, favorite_product_id (FK)
4. **Invoice**: id, total, date, customer_id (FK), user_id (FK), payment_method (ENUM), type (ENUM)
5. **Sale**: id, invoice_id (FK), product_variant_id (FK), quantity
6. **User**: id, email, password, username, name, lastname, role

## Required Packages

```json
{
  "dependencies": {
    "@nestjs/common": "^10.0.0",
    "@nestjs/core": "^10.0.0",
    "@nestjs/jwt": "^10.0.0",
    "@nestjs/passport": "^10.0.0",
    "@nestjs/platform-express": "^10.0.0",
    "@nestjs/swagger": "^7.0.0",
    "@nestjs/typeorm": "^10.0.0",
    "bcrypt": "^5.1.0",
    "class-transformer": "^0.5.1",
    "class-validator": "^0.14.0",
    "dotenv": "^16.0.0",
    "passport": "^0.7.0",
    "passport-jwt": "^4.0.0",
    "reflect-metadata": "^0.1.13",
    "rxjs": "^7.8.0",
    "swagger-ui-express": "^5.0.0",
    "typeorm": "^0.3.0"
  },
  "devDependencies": {
    "@nestjs/cli": "^10.0.0",
    "@nestjs/schematics": "^10.0.0",
    "@nestjs/testing": "^10.0.0",
    "@types/bcrypt": "^5.0.0",
    "@types/jest": "^29.0.0",
    "@types/node": "^20.0.0",
    "@types/passport-jwt": "^4.0.0",
    "jest": "^29.0.0",
    "source-map-support": "^0.5.21",
    "ts-jest": "^29.0.0",
    "ts-node": "^10.9.0",
    "typescript": "^5.0.0"
  }
}
```

## Authentication Flow

1. **Login**: POST `/auth/login` with email/password → returns JWT token (24hr expiry)
2. **Logout**: Client-side token removal (stateless JWT)
3. **Protected Routes**: All routes except `/auth/login` require valid JWT
4. **Role Check**: Admin role required for all operations

## Invoice Creation Flow (Chain of Responsibility)

```
POST /invoices
  ↓
InvoiceService.createInvoice()
  ↓
ValidationService.execute(validations[], invoiceData)
  ↓
ValidationFactory creates validation chain:
  1. ProductVariantExistsValidation
  2. QuantityPositiveValidation
  3. CustomerExistsValidation (if FACTURA)
  4. CustomerNullContadoValidation (if CONTADO)
  5. PaymentMethodValidValidation
  6. InvoiceTypeValidValidation
  ↓
If all pass:
  1. Create Invoice
  2. Create Sales
  3. Return Invoice with Sales
Else:
  Return 400 with error message
```

## API Endpoints

### Auth
- `POST /auth/login` - Login user
- `POST /auth/logout` - Logout (client removes token)

### Products
- `GET /products` - Find all products (with filters: name, deleted)
- `GET /products/:id` - Find one product
- `POST /products` - Create product (Admin only)
- `PATCH /products/:id` - Update product (Admin only)
- `DELETE /products/:id` - Soft delete product (Admin only)

### Product Variants
- `GET /product-variants` - Find all (with filters: name, price, deleted)
- `GET /product-variants/:id` - Find one
- `POST /product-variants` - Create (Admin only)
- `PATCH /product-variants/:id` - Update (Admin only)
- `DELETE /product-variants/:id` - Soft delete (Admin only)

### Customers
- `GET /customers` - Find all (with filters: name, email, deleted)
- `GET /customers/:id` - Find one
- `POST /customers` - Create (Admin only)
- `PATCH /customers/:id` - Update (Admin only)
- `DELETE /customers/:id` - Soft delete (Admin only)

### Invoices
- `GET /invoices` - Find all (with filters: date, customer, type, deleted)
- `GET /invoices/:id` - Find one (with sales)
- `POST /invoices` - Create invoice (Admin only)
- `DELETE /invoices/:id` - Soft delete (Admin only)
- `POST /invoices/:id/recover` - Recover soft-deleted invoice (Admin only)

### Users
- `GET /users` - Find all (Admin only)
- `GET /users/:id` - Find one (Admin only)

## Query Parameters for findAll

- `name` - Search by name (partial match)
- `startDate` - Filter by start date
- `endDate` - Filter by end date
- `onlyDeleted` - Show only deleted items
- `withDeleted` - Show both active and deleted items
- Default: Show only active items

## Seeder Strategy

1. Check if database has been seeded (using a `seeds_meta` table or flag)
2. If not seeded:
   - Run migrations
   - Create admin user from .env variables
   - Mark as seeded
3. If already seeded: Skip seeding

## Environment Variables (.env.example)

```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=bakery_db

# JWT
JWT_SECRET=your-super-secret-key-change-in-production
JWT_EXPIRES_IN=24h

# Admin User (Seeder)
ADMIN_EMAIL=admin@bakery.com
ADMIN_PASSWORD=SecurePass123!
ADMIN_USERNAME=admin
ADMIN_NAME=Admin
ADMIN_LASTNAME=User

# App
PORT=3000
NODE_ENV=development
```

## Docker Configuration

### Dockerfile
- Multi-stage build for production
- Node.js Alpine base image
- Copy package files, install dependencies
- Copy source code, build application
- Expose port 3000

### docker-compose.yml
- PostgreSQL service
- Application service
- Volume for data persistence
- Environment variables

## Testing Strategy

### Unit Tests (Jest)
- Services: Test business logic
- Validation classes: Test each validation rule
- DTOs: Test validation decorators

### Integration Tests
- Auth flow: Login, protected routes
- CRUD operations: Create, read, update, delete
- Invoice creation: Full flow with validations
- Soft delete: Verify deleted_at behavior
- Filters: Test query parameters

### E2E Tests
- Complete invoice creation flow
- Error scenarios (invalid data, missing relations)
- Role-based access control

## Test Files

```
test/
├── auth.e2e-spec.ts
├── products.e2e-spec.ts
├── product-variants.e2e-spec.ts
├── customers.e2e-spec.ts
├── invoices.e2e-spec.ts
└── jest-e2e.json
```

## Documentation (Swagger)

- Auto-generated from decorators
- JWT authentication setup in Swagger UI
- Request/Response schemas
- Example values for all endpoints

## Implementation Order

1. Setup project structure and install dependencies
2. Configure TypeORM and database connection
3. Create base entity with soft delete
4. Implement all entities
5. Create Auth module (login, JWT strategy, guards)
6. Implement CRUD modules (Products, Variants, Customers)
7. Implement Chain of Responsibility validation system
8. Implement Invoice module with validation chain
9. Create seeder service
10. Add Swagger documentation
11. Write unit and integration tests
12. Create Docker configuration
13. Create .env.example
14. Final testing and debugging

## Success Criteria

- [ ] All CRUD operations work correctly
- [ ] JWT authentication functional (24hr expiry)
- [ ] Invoice creation validates all rules
- [ ] Soft delete implemented on all entities
- [ ] Filters work on all findAll endpoints
- [ ] Seeder creates admin user only once
- [ ] Docker deployment works
- [ ] Swagger documentation available
- [ ] All tests pass
- [ ] Code follows NestJS best practices
