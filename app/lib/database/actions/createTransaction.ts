import { database } from '../index';
import { Transaction } from '../models/Transaction';
import { TransactionSplit } from '../models/TransactionSplit';

type CreateTransactionInput = {
  userId: string;
  description: string;
  totalAmount: number;
  type: 'REVENUE' | 'EXPENSE';
  categoryId: string;
  paymentMethodId: string;
  date: Date;
  dueDate: Date;
  groupId?: string | null;
  totalInstallments?: number;
  isRecurring?: boolean;
  frequency?: 'NONE' | 'MONTHLY' | 'WEEKLY';
};

function addMonths(date: Date, months: number): Date {
  const d = new Date(date);
  d.setMonth(d.getMonth() + months);
  return d;
}

export async function createTransaction(input: CreateTransactionInput): Promise<void> {
  const totalInstallments = Math.max(1, input.totalInstallments ?? 1);
  const amountPerInstallment = input.totalAmount / totalInstallments;

  await database.write(async () => {
    let parentId: string | null = null;

    for (let i = 0; i < totalInstallments; i++) {
      const installmentDueDate = addMonths(input.dueDate, i);

      const transaction = await database
        .get<Transaction>('transactions')
        .create((t) => {
          t.description = input.description;
          t.totalAmount = amountPerInstallment;
          t.type = input.type;
          t.categoryId = input.categoryId;
          t.paymentMethodId = input.paymentMethodId;
          t.groupId = input.groupId ?? null;
          t.createdBy = input.userId;
          t.date = input.date.getTime();
          t.dueDate = installmentDueDate.getTime();
          t.status = 'PENDING';
          t.parentId = i === 0 ? null : parentId;
          t.installmentNumber = i + 1;
          t.totalInstallments = totalInstallments;
          t.isRecurring = input.isRecurring ?? false;
          t.frequency = input.frequency ?? 'NONE';
          t.isDeleted = false;
        });

      if (i === 0) parentId = transaction.id;

      await database.get<TransactionSplit>('transaction_splits').create((s) => {
        s.transactionId = transaction.id;
        s.userId = input.userId;
        s.shareAmount = amountPerInstallment;
        s.isPayer = true;
        s.paidToPayer = false;
        s.isDeleted = false;
      });
    }
  });
}
