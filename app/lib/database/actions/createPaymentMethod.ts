import { database } from '../index';
import { PaymentMethod } from '../models/PaymentMethod';

type Input = {
  userId: string;
  name: string;
  type: 'CREDIT' | 'DEBIT' | 'PIX' | 'CASH';
  lastDigits?: string;
};

export async function createPaymentMethod(input: Input): Promise<void> {
  await database.write(async () => {
    await database.get<PaymentMethod>('payment_methods').create((pm) => {
      pm.userId = input.userId;
      pm.name = input.name;
      pm.type = input.type;
      pm.lastDigits = input.lastDigits ?? null;
      pm.isDeleted = false;
    });
  });
}

export async function softDeletePaymentMethod(id: string): Promise<void> {
  await database.write(async () => {
    const record = await database.get<PaymentMethod>('payment_methods').find(id);
    await record.update((pm) => {
      pm.isDeleted = true;
    });
  });
}
