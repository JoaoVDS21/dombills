import { database } from '@/lib/database';
import { Transaction } from '@/lib/database/models/Transaction';
import { Q } from '@nozbe/watermelondb';
import { useEffect, useState } from 'react';

export function useCriticalDueDates(userId: string) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;

    const sub = database
      .get<Transaction>('transactions')
      .query(
        Q.on('transaction_splits', [
          Q.where('user_id', userId),
          Q.where('is_deleted', false),
        ]),
        Q.where('status', 'PENDING'),
        Q.where('type', 'EXPENSE'),
        Q.where('is_deleted', false),
        Q.sortBy('due_date', Q.asc),
        Q.take(5),
      )
      .observe()
      .subscribe((txs) => {
        setTransactions(txs);
        setLoading(false);
      });

    return () => sub.unsubscribe();
  }, [userId]);

  return { transactions, loading };
}
