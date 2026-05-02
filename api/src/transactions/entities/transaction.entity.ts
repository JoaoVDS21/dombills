import {
  Column,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Category } from '../../categories/entities/category.entity';
import { Group } from '../../groups/entities/group.entity';
import { PaymentMethod } from '../../payment-methods/entities/payment-method.entity';
import { User } from '../../users/entities/user.entity';
import { TransactionSplit } from './transaction-split.entity';

export type TransactionType = 'REVENUE' | 'EXPENSE';
export type TransactionStatus = 'PENDING' | 'PAID';
export type TransactionFrequency = 'NONE' | 'MONTHLY' | 'WEEKLY';

@Entity('transactions')
export class Transaction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  description: string;

  @Column({ name: 'total_amount', type: 'decimal', precision: 12, scale: 2 })
  totalAmount: number;

  @Column({ type: 'enum', enum: ['REVENUE', 'EXPENSE'] })
  type: TransactionType;

  @Column({ name: 'category_id' })
  categoryId: string;

  @Column({ name: 'payment_method_id' })
  paymentMethodId: string;

  @Column({ name: 'group_id', type: 'varchar', nullable: true })
  groupId: string | null;

  @Column({ name: 'created_by' })
  createdBy: string;

  @Column({ type: 'date' })
  date: string;

  @Column({ name: 'due_date', type: 'date' })
  dueDate: string;

  @Column({ type: 'enum', enum: ['PENDING', 'PAID'], default: 'PENDING' })
  status: TransactionStatus;

  @Column({ name: 'parent_id', type: 'varchar', nullable: true })
  parentId: string | null;

  @Column({ name: 'installment_number', default: 1 })
  installmentNumber: number;

  @Column({ name: 'total_installments', default: 1 })
  totalInstallments: number;

  @Column({ name: 'is_recurring', default: false })
  isRecurring: boolean;

  @Column({ type: 'enum', enum: ['NONE', 'MONTHLY', 'WEEKLY'], default: 'NONE' })
  frequency: TransactionFrequency;

  @ManyToOne(() => Category)
  @JoinColumn({ name: 'category_id' })
  category: Category;

  @ManyToOne(() => PaymentMethod)
  @JoinColumn({ name: 'payment_method_id' })
  paymentMethod: PaymentMethod;

  @ManyToOne(() => Group, { nullable: true })
  @JoinColumn({ name: 'group_id' })
  group: Group | null;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'created_by' })
  creator: User;

  @OneToMany(() => TransactionSplit, (s) => s.transaction)
  splits: TransactionSplit[];

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt: Date | null;
}
