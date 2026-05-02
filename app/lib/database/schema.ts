import { appSchema, tableSchema } from '@nozbe/watermelondb';

export default appSchema({
  version: 1,
  tables: [
    tableSchema({
      name: 'groups',
      columns: [
        { name: 'name', type: 'string' },
        { name: 'hex_color', type: 'string' },
        { name: 'image_path', type: 'string', isOptional: true },
        { name: 'owner_id', type: 'string' },
        { name: 'updated_at', type: 'number' },
        { name: 'is_deleted', type: 'boolean' },
      ],
    }),
    tableSchema({
      name: 'group_members',
      columns: [
        { name: 'group_id', type: 'string', isIndexed: true },
        { name: 'user_id', type: 'string', isIndexed: true },
        { name: 'role', type: 'string' },
        { name: 'updated_at', type: 'number' },
        { name: 'is_deleted', type: 'boolean' },
      ],
    }),
    tableSchema({
      name: 'categories',
      columns: [
        { name: 'name', type: 'string' },
        { name: 'icon_name', type: 'string' },
        { name: 'color', type: 'string' },
        { name: 'user_id', type: 'string', isOptional: true },
        { name: 'updated_at', type: 'number' },
        { name: 'is_deleted', type: 'boolean' },
      ],
    }),
    tableSchema({
      name: 'payment_methods',
      columns: [
        { name: 'user_id', type: 'string', isIndexed: true },
        { name: 'name', type: 'string' },
        { name: 'type', type: 'string' },
        { name: 'last_digits', type: 'string', isOptional: true },
        { name: 'updated_at', type: 'number' },
        { name: 'is_deleted', type: 'boolean' },
      ],
    }),
    tableSchema({
      name: 'transactions',
      columns: [
        { name: 'description', type: 'string' },
        { name: 'total_amount', type: 'number' },
        { name: 'type', type: 'string' },
        { name: 'category_id', type: 'string' },
        { name: 'payment_method_id', type: 'string' },
        { name: 'group_id', type: 'string', isOptional: true },
        { name: 'created_by', type: 'string' },
        { name: 'date', type: 'number' },
        { name: 'due_date', type: 'number' },
        { name: 'status', type: 'string' },
        { name: 'parent_id', type: 'string', isOptional: true },
        { name: 'installment_number', type: 'number' },
        { name: 'total_installments', type: 'number' },
        { name: 'is_recurring', type: 'boolean' },
        { name: 'frequency', type: 'string' },
        { name: 'updated_at', type: 'number' },
        { name: 'is_deleted', type: 'boolean' },
      ],
    }),
    tableSchema({
      name: 'transaction_splits',
      columns: [
        { name: 'transaction_id', type: 'string', isIndexed: true },
        { name: 'user_id', type: 'string', isIndexed: true },
        { name: 'share_amount', type: 'number' },
        { name: 'is_payer', type: 'boolean' },
        { name: 'paid_to_payer', type: 'boolean' },
        { name: 'updated_at', type: 'number' },
        { name: 'is_deleted', type: 'boolean' },
      ],
    }),
  ],
});
