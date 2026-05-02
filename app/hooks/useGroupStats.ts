import { database } from '@/lib/database';
import { Transaction } from '@/lib/database/models/Transaction';
import { TransactionSplit } from '@/lib/database/models/TransactionSplit';
import { Q } from '@nozbe/watermelondb';
import { useEffect, useState } from 'react';

type GroupStats = {
  groupTotal: number;
  userShare: number;
  userPaid: number;
  loading: boolean;
};

export function useGroupStats(groupId: string, userId: string): GroupStats {
  const [stats, setStats] = useState<Omit<GroupStats, 'loading'>>({
    groupTotal: 0,
    userShare: 0,
    userPaid: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!groupId || !userId) return;

    const sub = database
      .get<Transaction>('transactions')
      .query(
        Q.where('group_id', groupId),
        Q.where('type', 'EXPENSE'),
        Q.where('is_deleted', false),
      )
      .observe()
      .subscribe(async (txs) => {
        const groupTotal = txs.reduce((sum, tx) => sum + tx.totalAmount, 0);

        if (txs.length === 0) {
          setStats({ groupTotal: 0, userShare: 0, userPaid: 0 });
          setLoading(false);
          return;
        }

        const txIds = txs.map((tx) => tx.id);
        const splits = await database
          .get<TransactionSplit>('transaction_splits')
          .query(
            Q.where('user_id', userId),
            Q.where('is_deleted', false),
            Q.where('transaction_id', Q.oneOf(txIds)),
          )
          .fetch();

        const userShare = splits.reduce((sum, s) => sum + s.shareAmount, 0);
        const userPaid = splits
          .filter((s) => s.isPayer || s.paidToPayer)
          .reduce((sum, s) => sum + s.shareAmount, 0);

        setStats({ groupTotal, userShare, userPaid });
        setLoading(false);
      });

    return () => sub.unsubscribe();
  }, [groupId, userId]);

  return { ...stats, loading };
}
