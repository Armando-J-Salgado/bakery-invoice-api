import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../entities/user.entity';

@Injectable()
export class SeederService {
  private readonly logger = new Logger(SeederService.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async seed(): Promise<void> {
    const adminExists = await this.userRepository.findOne({
      where: { email: process.env.ADMIN_EMAIL },
    });

    if (adminExists) {
      this.logger.log('Admin user already exists, skipping seeding...');
      return;
    }

    const hashedPassword = await bcrypt.hash(
      process.env.ADMIN_PASSWORD ?? '1234',
      10,
    );

    const adminUser = this.userRepository.create({
      email: process.env.ADMIN_EMAIL,
      username: process.env.ADMIN_USERNAME,
      name: process.env.ADMIN_NAME,
      lastname: process.env.ADMIN_LASTNAME,
      password: hashedPassword,
      role: 'Admin' as any,
    });

    await this.userRepository.save(adminUser);
    this.logger.log('Admin user created successfully!');
    return;
  }
}
