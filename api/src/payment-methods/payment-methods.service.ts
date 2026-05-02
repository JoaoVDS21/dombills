import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PaymentMethod } from './entities/payment-method.entity';

@Injectable()
export class PaymentMethodsService {
  constructor(
    @InjectRepository(PaymentMethod)
    private readonly repo: Repository<PaymentMethod>,
  ) {}

  findByUser(userId: string): Promise<PaymentMethod[]> {
    return this.repo.find({ where: { userId }, order: { name: 'ASC' } });
  }

  findById(id: string): Promise<PaymentMethod | null> {
    return this.repo.findOneBy({ id });
  }

  create(data: Partial<PaymentMethod>): Promise<PaymentMethod> {
    return this.repo.save(this.repo.create(data));
  }

  save(pm: PaymentMethod): Promise<PaymentMethod> {
    return this.repo.save(pm);
  }

  softDelete(id: string) {
    return this.repo.softDelete(id);
  }
}
