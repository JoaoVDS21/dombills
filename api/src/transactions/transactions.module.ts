import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TransactionSplit } from './entities/transaction-split.entity';
import { Transaction } from './entities/transaction.entity';
import { TransactionsService } from './transactions.service';

@Module({
  imports: [TypeOrmModule.forFeature([Transaction, TransactionSplit])],
  providers: [TransactionsService],
  exports: [TransactionsService],
})
export class TransactionsModule {}
