import { Model } from '@nozbe/watermelondb';
import { date, field, readonly, text } from '@nozbe/watermelondb/decorators';

export class PaymentMethod extends Model {
  static table = 'payment_methods';

  @text('user_id') userId!: string;
  @text('name') name!: string;
  @text('type') type!: 'CREDIT' | 'DEBIT' | 'PIX' | 'CASH';
  @field('last_digits') lastDigits!: string | null;
  @readonly @date('updated_at') updatedAt!: Date;
  @field('is_deleted') isDeleted!: boolean;
}
