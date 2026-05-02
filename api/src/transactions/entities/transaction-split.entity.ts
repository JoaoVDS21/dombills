import {
  Column,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Transaction } from './transaction.entity';

@Entity('transaction_splits')
export class TransactionSplit {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'transaction_id' })
  transactionId: string;

  @Column({ name: 'user_id' })
  userId: string;

  @Column({ name: 'share_amount', type: 'decimal', precision: 12, scale: 2 })
  shareAmount: number;

  @Column({ name: 'is_payer', default: false })
  isPayer: boolean;

  @Column({ name: 'paid_to_payer', default: false })
  paidToPayer: boolean;

  @ManyToOne(() => Transaction, (t) => t.splits)
  @JoinColumn({ name: 'transaction_id' })
  transaction: Transaction;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt: Date | null;
}
