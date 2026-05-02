import { Model } from '@nozbe/watermelondb';
import { date, field, readonly, text } from '@nozbe/watermelondb/decorators';

export class GroupMember extends Model {
  static table = 'group_members';

  @text('group_id') groupId!: string;
  @text('user_id') userId!: string;
  @text('role') role!: 'ADMIN' | 'MEMBER';
  @readonly @date('updated_at') updatedAt!: Date;
  @field('is_deleted') isDeleted!: boolean;
}
