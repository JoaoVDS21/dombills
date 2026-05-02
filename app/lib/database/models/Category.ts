import { Model } from '@nozbe/watermelondb';
import { date, field, readonly, text } from '@nozbe/watermelondb/decorators';

export class Category extends Model {
  static table = 'categories';

  @text('name') name!: string;
  @text('icon_name') iconName!: string;
  @text('color') color!: string;
  @field('user_id') userId!: string | null;
  @readonly @date('updated_at') updatedAt!: Date;
  @field('is_deleted') isDeleted!: boolean;
}
