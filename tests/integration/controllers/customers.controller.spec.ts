import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CustomersModule } from '../../../src/modules/customers/customers.module';
import { Customer } from '../../../src/entities/customer.entity';
import { ProductVariant } from '../../../src/entities/product-variant.entity';
import { Product } from '../../../src/entities/product.entity';
import { JwtAuthGuard } from '../../../src/common/guards/jwt-auth.guard';

describe('CustomersController - Integration Tests', () => {
  let app: INestApplication;
  let moduleRef: TestingModule;

  const mockAuthGuard = {
    canActivate: (context: any) => {
      const req = context.switchToHttp().getRequest();
      req.user = { userId: 1, email: 'test@example.com', role: 'admin' };
      return true;
    },
  };

  beforeAll(async () => {
    moduleRef = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: 'better-sqlite3',
          database: ':memory:',
          entities: [Customer, ProductVariant, Product],
          synchronize: true,
          dropSchema: true,
          logging: false,
        }),
        CustomersModule,
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue(mockAuthGuard)
      .compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }));
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /customers', () => {
    it('should create a customer successfully', async () => {
      const customerData = {
        name: 'John Doe',
        email: 'john@example.com',
        address: '123 Main St',
        phoneNumber: '+1234567890',
      };

      const response = await request(app.getHttpServer())
        .post('/customers')
        .send(customerData)
        .expect(201);

      expect(response.body.name).toBe('John Doe');
      expect(response.body.email).toBe('john@example.com');
      expect(response.body.id).toBeDefined();
    });

    it('should return 400 if name is missing', async () => {
      const customerData = {
        email: 'john@example.com',
      };

      await request(app.getHttpServer())
        .post('/customers')
        .send(customerData)
        .expect(400);
    });

    it('should return 400 if email is invalid', async () => {
      const customerData = {
        name: 'John Doe',
        email: 'invalid-email',
      };

      await request(app.getHttpServer())
        .post('/customers')
        .send(customerData)
        .expect(400);
    });

    it('should return 404 if favorite product does not exist', async () => {
      const customerData = {
        name: 'John Doe',
        email: 'john@example.com',
        favoriteProductId: 999,
      };

      await request(app.getHttpServer())
        .post('/customers')
        .send(customerData)
        .expect(404);
    });
  });

  describe('GET /customers', () => {
    it('should return all customers', async () => {
      // First create a customer
      await request(app.getHttpServer())
        .post('/customers')
        .send({ name: 'Test User', email: 'test@example.com' });

      const response = await request(app.getHttpServer())
        .get('/customers')
        .expect(200);

      expect(response.body).toBeInstanceOf(Array);
      expect(response.body.length).toBeGreaterThanOrEqual(1);
    });

    it('should filter customers by name', async () => {
      const response = await request(app.getHttpServer())
        .get('/customers?name=Test')
        .expect(200);

      expect(response.body).toBeInstanceOf(Array);
    });

    it('should filter customers by email', async () => {
      const response = await request(app.getHttpServer())
        .get('/customers?email=test@example.com')
        .expect(200);

      expect(response.body).toBeInstanceOf(Array);
    });
  });

  describe('GET /customers/:id', () => {
    let createdCustomerId: number;

    beforeAll(async () => {
      const response = await request(app.getHttpServer())
        .post('/customers')
        .send({ name: 'Single Test', email: 'single@test.com' });
      createdCustomerId = response.body.id;
    });

    it('should return a customer by ID', async () => {
      const response = await request(app.getHttpServer())
        .get(`/customers/${createdCustomerId}`)
        .expect(200);

      expect(response.body.id).toBe(createdCustomerId);
      expect(response.body.name).toBe('Single Test');
    });

    it('should return 404 for non-existent customer', async () => {
      await request(app.getHttpServer())
        .get('/customers/99999')
        .expect(404);
    });
  });

  describe('PATCH /customers/:id', () => {
    let createdCustomerId: number;

    beforeAll(async () => {
      const response = await request(app.getHttpServer())
        .post('/customers')
        .send({ name: 'Update Test', email: 'update@test.com' });
      createdCustomerId = response.body.id;
    });

    it('should update a customer successfully', async () => {
      const updateData = {
        name: 'Updated Name',
        email: 'updated@example.com',
      };

      const response = await request(app.getHttpServer())
        .patch(`/customers/${createdCustomerId}`)
        .send(updateData)
        .expect(200);

      expect(response.body.name).toBe('Updated Name');
      expect(response.body.email).toBe('updated@example.com');
    });

    it('should return 404 for non-existent customer', async () => {
      await request(app.getHttpServer())
        .patch('/customers/99999')
        .send({ name: 'Test' })
        .expect(404);
    });

    it('should return 400 if email is invalid', async () => {
      await request(app.getHttpServer())
        .patch(`/customers/${createdCustomerId}`)
        .send({ email: 'invalid-email' })
        .expect(400);
    });
  });

  describe('DELETE /customers/:id', () => {
    let createdCustomerId: number;

    beforeAll(async () => {
      const response = await request(app.getHttpServer())
        .post('/customers')
        .send({ name: 'Delete Test', email: 'delete@test.com' });
      createdCustomerId = response.body.id;
    });

    it('should soft delete a customer', async () => {
      await request(app.getHttpServer())
        .delete(`/customers/${createdCustomerId}`)
        .expect(200);

      // Verify customer is soft deleted (should not appear in normal list)
      const response = await request(app.getHttpServer())
        .get(`/customers/${createdCustomerId}`)
        .expect(404);
    });

    it('should return 404 for non-existent customer', async () => {
      await request(app.getHttpServer())
        .delete('/customers/99999')
        .expect(404);
    });
  });

  describe('POST /customers/:id/recover', () => {
    let deletedCustomerId: number;

    beforeAll(async () => {
      const response = await request(app.getHttpServer())
        .post('/customers')
        .send({ name: 'Recover Test', email: 'recover@test.com' });
      deletedCustomerId = response.body.id;

      // Delete the customer
      await request(app.getHttpServer())
        .delete(`/customers/${deletedCustomerId}`)
        .expect(200);
    });

    it('should recover a soft-deleted customer', async () => {
      const response = await request(app.getHttpServer())
        .post(`/customers/${deletedCustomerId}/recover`)
        .expect(201);

      expect(response.body.message).toContain('recovered');
    });

    it('should return 404 for non-existent customer', async () => {
      await request(app.getHttpServer())
        .post('/customers/99999/recover')
        .expect(404);
    });
  });
});
