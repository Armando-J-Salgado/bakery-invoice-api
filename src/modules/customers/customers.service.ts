import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { Customer } from '../../entities/customer.entity';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';

@Injectable()
export class CustomersService {
  constructor(
    @InjectRepository(Customer)
    private customersRepository: Repository<Customer>,
  ) {}

  async create(createDto: CreateCustomerDto): Promise<Customer> {
    const customer = this.customersRepository.create(createDto);
    return this.customersRepository.save(customer);
  }

  async findAll(params?: {
    name?: string;
    email?: string;
    onlyDeleted?: boolean;
    withDeleted?: boolean;
  }): Promise<Customer[]> {
    let query = this.customersRepository.createQueryBuilder('customer');

    if (params?.onlyDeleted) {
      query.withDeleted().where('customer.deleted_at IS NOT NULL');
    } else if (params?.withDeleted) {
      query.withDeleted();
    }

    if (params?.name) {
      query.andWhere('customer.name LIKE :name', { name: `%${params.name}%` });
    }

    if (params?.email) {
      query.andWhere('customer.email LIKE :email', { email: `%${params.email}%` });
    }

    return query.getMany();
  }

  async findOne(id: number): Promise<Customer> {
    const customer = await this.customersRepository.findOne({ where: { id } });
    if (!customer) {
      throw new NotFoundException(`Customer with ID ${id} not found`);
    }
    return customer;
  }

  async update(id: number, updateDto: UpdateCustomerDto): Promise<Customer> {
    await this.findOne(id);
    await this.customersRepository.update(id, updateDto);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    const customer = await this.findOne(id);
    await this.customersRepository.softRemove(customer);
  }

  async recover(id: number): Promise<void> {
    const customer = await this.customersRepository.findOne({
      where: { id },
      withDeleted: true,
    });
    if (!customer) {
      throw new NotFoundException(`Customer with ID ${id} not found`);
    }
    await this.customersRepository.recover(customer);
  }
}
