import { Column, Entity, OneToMany } from 'typeorm';
import { BaseEntity } from './base.entity';
import { ProductVariant } from './product-variant.entity';

@Entity('products')
export class Product extends BaseEntity {
  @Column()
  name: string;

  @OneToMany(() => ProductVariant, (productVariant) => productVariant.product)
  variants: ProductVariant[];
}
