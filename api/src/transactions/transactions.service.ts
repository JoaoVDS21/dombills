import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, IsNull, Repository } from 'typeorm';
import { TransactionSplit } from './entities/transaction-split.entity';
import { Transaction } from './entities/transaction.entity';

@Injectable()
export class TransactionsService {
  constructor(
    @InjectRepository(Transaction)
    private readonly transactions: Repository<Transaction>,
    @InjectRepository(TransactionSplit)
    private readonly splits: Repository<TransactionSplit>,
  ) {}

  findByUser(userId: string): Promise<Transaction[]> {
    return this.transactions
      .createQueryBuilder('t')
      .innerJoin('t.splits', 's', 's.user_id = :userId AND s.deleted_at IS NULL', { userId })
      .where('t.deleted_at IS NULL')
      .orderBy('t.due_date', 'ASC')
      .getMany();
  }

  findPendingByUser(userId: string) {
    return this.splits.find({
      where: { userId, paidToPayer: false },
      relations: ['transaction'],
    });
  }

  findById(id: string): Promise<Transaction | null> {
    return this.transactions.findOne({ where: { id }, relations: ['splits'] });
  }

  createWithSplits(
    transactionData: Partial<Transaction>,
    splitsData: Partial<TransactionSplit>[],
  ): Promise<Transaction> {
    return this.transactions.manager.transaction(async (em: EntityManager) => {
      const tx = await em.save(Transaction, em.create(Transaction, transactionData));
      await em.save(
        TransactionSplit,
        splitsData.map((s) => em.create(TransactionSplit, { ...s, transactionId: tx.id })),
      );
      return tx;
    });
  }

  save(tx: Transaction): Promise<Transaction> {
    return this.transactions.save(tx);
  }

  saveSplit(split: TransactionSplit): Promise<TransactionSplit> {
    return this.splits.save(split);
  }

  softDelete(id: string) {
    return this.transactions.softDelete(id);
  }
}
