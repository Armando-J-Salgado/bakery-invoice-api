import { Column, Entity, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from './base.entity';
import { Invoice } from './invoice.entity';
import { ProductVariant } from './product-variant.entity';

@Entity('sales')
export class Sale extends BaseEntity {
  @ManyToOne(() => Invoice, (invoice) => invoice.sales, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'invoice_id' })
  invoice: Invoice;

  @Column({ name: 'invoice_id' })
  invoiceId: number;

  @ManyToOne(() => ProductVariant, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'product_variant_id' })
  productVariant: ProductVariant;

  @Column({ name: 'product_variant_id' })
  productVariantId: number;

  @Column()
  quantity: number;
}
