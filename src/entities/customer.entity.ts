import { Column, Entity, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from './base.entity';
import { ProductVariant } from './product-variant.entity';

@Entity('customers')
export class Customer extends BaseEntity {
  @Column()
  name: string;

  @Column({ nullable: true })
  address?: string;

  @Column({ name: 'phone_number', nullable: true })
  phoneNumber?: string;

  @Column({ nullable: true })
  email?: string;

  @ManyToOne(() => ProductVariant, { nullable: true })
  @JoinColumn({ name: 'favorite_product_id' })
  favoriteProduct?: ProductVariant;

  @Column({ name: 'favorite_product_id', nullable: true })
  favoriteProductId?: number;
}
