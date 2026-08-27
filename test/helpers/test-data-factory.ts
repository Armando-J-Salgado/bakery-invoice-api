import { PaymentMethod, InvoiceType } from '../../src/entities/enums';

export class TestDataFactory {
  static createCustomer(overrides: Partial<any> = {}) {
    return {
      name: `Test Customer ${Date.now()}`,
      address: '123 Test Street',
      phoneNumber: '+1234567890',
      email: `test${Date.now()}@example.com`,
      ...overrides,
    };
  }

  static createProduct(overrides: Partial<any> = {}) {
    return {
      name: `Test Product ${Date.now()}`,
      description: 'Test product description',
      ...overrides,
    };
  }

  static createProductVariant(overrides: Partial<any> = {}) {
    return {
      name: `Test Variant ${Date.now()}`,
      price: 10.00,
      stock: 100,
      sku: `SKU-${Date.now()}`,
      ...overrides,
    };
  }

  static createInvoice(overrides: Partial<any> = {}) {
    return {
      customerId: overrides.customerId || null,
      paymentMethod: PaymentMethod.CASH,
      type: InvoiceType.CONTADO,
      sales: [
        {
          productVariantId: 1,
          quantity: 2,
        },
      ],
      ...overrides,
    };
  }

  static createUser(overrides: Partial<any> = {}) {
    return {
      email: `user${Date.now()}@test.com`,
      username: `user${Date.now()}`,
      name: 'Test',
      lastname: 'User',
      password: 'hashedPassword123',
      role: 'User',
      ...overrides,
    };
  }

  static createLoginDto(overrides: Partial<any> = {}) {
    return {
      email: 'admin@test.com',
      password: '123456',
      ...overrides,
    };
  }
}
