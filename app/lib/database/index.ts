import { Database } from '@nozbe/watermelondb';
import SQLiteAdapter from '@nozbe/watermelondb/adapters/sqlite';
import schema from './schema';
import { Category } from './models/Category';
import { Group } from './models/Group';
import { GroupMember } from './models/GroupMember';
import { PaymentMethod } from './models/PaymentMethod';
import { Transaction } from './models/Transaction';
import { TransactionSplit } from './models/TransactionSplit';

const adapter = new SQLiteAdapter({
  schema,
  jsi: true,
  onSetUpError: (error) => {
    console.error('[WatermelonDB] Setup error:', error);
  },
});

export const database = new Database({
  adapter,
  modelClasses: [
    Group,
    GroupMember,
    Category,
    PaymentMethod,
    Transaction,
    TransactionSplit,
  ],
});
