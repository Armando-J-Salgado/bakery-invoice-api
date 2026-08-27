import 'dotenv/config';
import { Customer } from 'src/entities/customer.entity';
import { Invoice } from 'src/entities/invoice.entity';
import { ProductVariant } from 'src/entities/product-variant.entity';
import { Product } from 'src/entities/product.entity';
import { Sale } from 'src/entities/sale.entity';
import { User } from 'src/entities/user.entity';

export const databaseConfig = {
  type: 'postgres' as const,
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME || 'bakery_db',
  entities: [Customer, Invoice, ProductVariant, Product, Sale, User],
  synchronize: true,
  logging: process.env.NODE_ENV === 'development',
};
