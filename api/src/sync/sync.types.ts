export type RawRecord = Record<string, unknown>;

export type TableChanges = {
  created: RawRecord[];
  updated: RawRecord[];
  deleted: string[];
};

export type SyncChanges = Partial<Record<
  'groups' | 'group_members' | 'categories' | 'payment_methods' | 'transactions' | 'transaction_splits',
  TableChanges
>>;

export type PullResponse = {
  changes: Record<string, TableChanges>;
  timestamp: number;
};

export function emptyTable(): TableChanges {
  return { created: [], updated: [], deleted: [] };
}
