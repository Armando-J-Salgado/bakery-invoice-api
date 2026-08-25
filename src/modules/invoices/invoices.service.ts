import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Brackets } from 'typeorm';
import { Invoice } from '../../entities/invoice.entity';
import { Sale } from '../../entities/sale.entity';
import { User } from '../../entities/user.entity';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { ValidationService } from '../../common/validations/validation-service';
import { ValidationFactory } from '../../common/validations/validation-factory';
import { PaymentMethod, InvoiceType } from '../../entities/enums';
import { ProductVariant } from '../../entities/product-variant.entity';

@Injectable()
export class InvoicesService {
  constructor(
    @InjectRepository(Invoice)
    private readonly invoiceRepository: Repository<Invoice>,
    @InjectRepository(Sale)
    private readonly saleRepository: Repository<Sale>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(ProductVariant)
    private readonly productVariantRepository: Repository<ProductVariant>,
    private readonly validationService: ValidationService,
    private readonly validationFactory: ValidationFactory,
  ) {}

  private getCreateValidations() {
    return [
      'productVariantExists' as const,
      'quantityPositive' as const,
      'invoiceTypeValid' as const,
      'paymentMethodValid' as const,
      'customerExists' as const,
      'customerNullContado' as const,
    ];
  }

  async create(createInvoiceDto: CreateInvoiceDto, userId: number) {
    // Validate using Chain of Responsibility
    const validationResult = await this.validationService.execute(
      this.getCreateValidations(),
      createInvoiceDto,
    );

    if (!validationResult.isValid) {
      throw new BadRequestException(validationResult.error);
    }

    // Calculate total
    let total = 0;
    for (const saleItem of createInvoiceDto.sales) {
      const variant = await this.productVariantRepository.findOne({
        where: { id: saleItem.productVariantId },
      });
      total += variant.price * saleItem.quantity;
    }

    // Create invoice
    const invoice = this.invoiceRepository.create({
      total,
      date: new Date(),
      customerId: createInvoiceDto.customerId || null,
      userId,
      paymentMethod: createInvoiceDto.paymentMethod as PaymentMethod,
      type: createInvoiceDto.type as InvoiceType,
      sales: [],
    });

    const savedInvoice = await this.invoiceRepository.save(invoice);

    // Create sales
    const sales = createInvoiceDto.sales.map((saleItem) =>
      this.saleRepository.create({
        invoiceId: savedInvoice.id,
        productVariantId: saleItem.productVariantId,
        quantity: saleItem.quantity,
      }),
    );

    await this.saleRepository.save(sales);

    // Return invoice with loaded sales
    return this.findOne(savedInvoice.id);
  }

  async findAll(queryParams: {
    startDate?: string;
    endDate?: string;
    customerId?: number;
    type?: InvoiceType;
    onlyDeleted?: boolean;
    withDeleted?: boolean;
  }) {
    const query = this.invoiceRepository.createQueryBuilder('invoice');

    if (queryParams.onlyDeleted) {
      query.withDeleted().where('invoice.deleted_at IS NOT NULL');
    } else if (queryParams.withDeleted) {
      query.withDeleted();
    }

    if (queryParams.startDate) {
      query.andWhere('invoice.date >= :startDate', {
        startDate: new Date(queryParams.startDate),
      });
    }

    if (queryParams.endDate) {
      query.andWhere('invoice.date <= :endDate', {
        endDate: new Date(queryParams.endDate),
      });
    }

    if (queryParams.customerId) {
      query.andWhere('invoice.customerId = :customerId', {
        customerId: queryParams.customerId,
      });
    }

    if (queryParams.type) {
      query.andWhere('invoice.type = :type', { type: queryParams.type });
    }

    query.leftJoinAndSelect('invoice.customer', 'customer');
    query.leftJoinAndSelect('invoice.user', 'user');
    query.leftJoinAndSelect('invoice.sales', 'sales');
    query.orderBy('invoice.created_at', 'DESC');

    return query.getMany();
  }

  async findOne(id: number, includeDeleted = false) {
    const query = this.invoiceRepository.createQueryBuilder('invoice');

    if (includeDeleted) {
      query.withDeleted();
    }

    query
      .where('invoice.id = :id', { id })
      .leftJoinAndSelect('invoice.customer', 'customer')
      .leftJoinAndSelect('invoice.user', 'user')
      .leftJoinAndSelect('invoice.sales', 'sales')
      .leftJoinAndSelect('sales.productVariant', 'productVariant');

    const invoice = await query.getOne();

    if (!invoice) {
      throw new NotFoundException(`Invoice with ID ${id} not found`);
    }

    return invoice;
  }

  async remove(id: number) {
    const invoice = await this.findOne(id);
    return this.invoiceRepository.softRemove(invoice);
  }

  async recover(id: number) {
    const invoice = await this.findOne(id, true);
    
    if (!invoice.deleted_at) {
      throw new BadRequestException('Invoice is not deleted');
    }

    return this.invoiceRepository.recover(invoice);
  }
}
