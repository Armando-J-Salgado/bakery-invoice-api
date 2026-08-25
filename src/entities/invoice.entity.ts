import { Column, Entity, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { BaseEntity } from './base.entity';
import { Customer } from './customer.entity';
import { User } from './user.entity';
import { PaymentMethod, InvoiceType } from './enums';
import { Sale } from './sale.entity';

@Entity('invoices')
export class Invoice extends BaseEntity {
  @Column('decimal', { precision: 10, scale: 2 })
  total: number;

  @Column()
  date: Date;

  @ManyToOne(() => Customer, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'customer_id' })
  customer?: Customer;

  @Column({ name: 'customer_id', nullable: true })
  customerId?: number;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'user_id' })
  userId: number;

  @Column({
    type: 'enum',
    enum: PaymentMethod,
    name: 'payment_method',
  })
  paymentMethod: PaymentMethod;

  @Column({
    type: 'enum',
    enum: InvoiceType,
  })
  type: InvoiceType;

  @OneToMany(() => Sale, (sale) => sale.invoice, { cascade: true })
  sales: Sale[];
}
