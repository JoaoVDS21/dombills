import { Model } from '@nozbe/watermelondb';
import { date, field, readonly, text } from '@nozbe/watermelondb/decorators';

export class Transaction extends Model {
  static table = 'transactions';

  @text('description') description!: string;
  @field('total_amount') totalAmount!: number;
  @text('type') type!: 'REVENUE' | 'EXPENSE';
  @text('category_id') categoryId!: string;
  @text('payment_method_id') paymentMethodId!: string;
  @field('group_id') groupId!: string | null;
  @text('created_by') createdBy!: string;
  @field('date') date!: number;
  @field('due_date') dueDate!: number;
  @text('status') status!: 'PENDING' | 'PAID';
  @field('parent_id') parentId!: string | null;
  @field('installment_number') installmentNumber!: number;
  @field('total_installments') totalInstallments!: number;
  @field('is_recurring') isRecurring!: boolean;
  @text('frequency') frequency!: 'NONE' | 'MONTHLY' | 'WEEKLY';
  @readonly @date('updated_at') updatedAt!: Date;
  @field('is_deleted') isDeleted!: boolean;
}
