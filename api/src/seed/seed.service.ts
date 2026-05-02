import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { randomUUID } from 'crypto';
import { DataSource, IsNull } from 'typeorm';
import { Category } from '../categories/entities/category.entity';
import { PaymentMethod } from '../payment-methods/entities/payment-method.entity';

const SYSTEM_CATEGORIES = [
  { name: 'Alimentação', iconName: 'utensils', color: '#f97316' },
  { name: 'Transporte', iconName: 'car', color: '#3b82f6' },
  { name: 'Saúde', iconName: 'heart', color: '#ef4444' },
  { name: 'Lazer', iconName: 'gamepad-2', color: '#8b5cf6' },
  { name: 'Moradia', iconName: 'house', color: '#10b981' },
  { name: 'Educação', iconName: 'book-open', color: '#f59e0b' },
  { name: 'Compras', iconName: 'shopping-bag', color: '#ec4899' },
  { name: 'Investimentos', iconName: 'trending-up', color: '#06b6d4' },
  { name: 'Salário', iconName: 'banknote', color: '#22c55e' },
  { name: 'Outros', iconName: 'circle-dot', color: '#6b7280' },
] as const;

const DEFAULT_PAYMENT_METHODS = [
  { name: 'Dinheiro', type: 'CASH' },
  { name: 'PIX', type: 'PIX' },
  { name: 'Cartão de Débito', type: 'DEBIT' },
  { name: 'Cartão de Crédito', type: 'CREDIT' },
] as const;

@Injectable()
export class SeedService implements OnApplicationBootstrap {
  constructor(@InjectDataSource() private readonly db: DataSource) {}

  async onApplicationBootstrap() {
    await this.seedSystemCategories();
  }

  private async seedSystemCategories() {
    const repo = this.db.getRepository(Category);
    const count = await repo.count({ where: { userId: IsNull() } });
    if (count > 0) return;

    await repo.save(
      SYSTEM_CATEGORIES.map((c) => repo.create({ id: randomUUID(), ...c, userId: null })),
    );
  }

  async createDefaultPaymentMethods(userId: string) {
    const repo = this.db.getRepository(PaymentMethod);
    const count = await repo.count({ where: { userId } });
    if (count > 0) return;

    await repo.save(
      DEFAULT_PAYMENT_METHODS.map((pm) =>
        repo.create({ id: randomUUID(), ...pm, userId, lastDigits: null }),
      ),
    );
  }
}
