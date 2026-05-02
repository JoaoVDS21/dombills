import { Model } from '@nozbe/watermelondb';
import { date, field, readonly, text } from '@nozbe/watermelondb/decorators';

export class TransactionSplit extends Model {
  static table = 'transaction_splits';

  @text('transaction_id') transactionId!: string;
  @text('user_id') userId!: string;
  @field('share_amount') shareAmount!: number;
  @field('is_payer') isPayer!: boolean;
  @field('paid_to_payer') paidToPayer!: boolean;
  @readonly @date('updated_at') updatedAt!: Date;
  @field('is_deleted') isDeleted!: boolean;
}
