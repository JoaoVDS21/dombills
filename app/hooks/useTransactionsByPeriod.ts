import { database } from '@/lib/database';
import { Transaction } from '@/lib/database/models/Transaction';
import { Q } from '@nozbe/watermelondb';
import { useEffect, useState } from 'react';

export function useTransactionsByPeriod(
  userId: string,
  startMs: number,
  endMs: number,
) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId || startMs > endMs) return;

    setLoading(true);

    const sub = database
      .get<Transaction>('transactions')
      .query(
        Q.on('transaction_splits', [
          Q.where('user_id', userId),
          Q.where('is_deleted', false),
        ]),
        Q.where('date', Q.gte(startMs)),
        Q.where('date', Q.lte(endMs)),
        Q.where('is_deleted', false),
        Q.sortBy('date', Q.asc),
      )
      .observe()
      .subscribe((txs) => {
        setTransactions(txs);
        setLoading(false);
      });

    return () => sub.unsubscribe();
  }, [userId, startMs, endMs]);

  return { transactions, loading };
}
