import { Model } from '@nozbe/watermelondb';
import { date, field, readonly, text } from '@nozbe/watermelondb/decorators';

export class Group extends Model {
  static table = 'groups';

  @text('name') name!: string;
  @text('hex_color') hexColor!: string;
  @field('image_path') imagePath!: string | null;
  @text('owner_id') ownerId!: string;
  @readonly @date('updated_at') updatedAt!: Date;
  @field('is_deleted') isDeleted!: boolean;
}
