import { database } from '@/lib/database';
import { Transaction } from '@/lib/database/models/Transaction';
import { TransactionSplit } from '@/lib/database/models/TransactionSplit';
import { Q } from '@nozbe/watermelondb';
import { useEffect, useState } from 'react';

export function useHomeStats(userId: string) {
  const [personal, setPersonal] = useState(0);
  const [group, setGroup] = useState(0);
  const [revenue, setRevenue] = useState(0);
  const [paid, setPaid] = useState(0);
  const [loaded, setLoaded] = useState({ personal: false, group: false, revenue: false, paid: false });

  useEffect(() => {
    if (!userId) return;

    setLoaded({ personal: false, group: false, revenue: false, paid: false });

    const personalSub = database
      .get<TransactionSplit>('transaction_splits')
      .query(
        Q.where('user_id', userId),
        Q.where('paid_to_payer', false),
        Q.where('is_deleted', false),
        Q.on('transactions', [Q.where('is_deleted', false), Q.where('group_id', null)]),
      )
      .observe()
      .subscribe((splits) => {
        setPersonal(splits.reduce((sum, s) => sum + s.shareAmount, 0));
        setLoaded((prev) => ({ ...prev, personal: true }));
      });

    const groupSub = database
      .get<TransactionSplit>('transaction_splits')
      .query(
        Q.where('user_id', userId),
        Q.where('paid_to_payer', false),
        Q.where('is_deleted', false),
        Q.on('transactions', [Q.where('is_deleted', false), Q.where('group_id', Q.notEq(null))]),
      )
      .observe()
      .subscribe((splits) => {
        setGroup(splits.reduce((sum, s) => sum + s.shareAmount, 0));
        setLoaded((prev) => ({ ...prev, group: true }));
      });

    const revenueSub = database
      .get<Transaction>('transactions')
      .query(
        Q.where('type', 'REVENUE'),
        Q.where('created_by', userId),
        Q.where('is_deleted', false),
      )
      .observe()
      .subscribe((txs) => {
        setRevenue(txs.reduce((sum, tx) => sum + tx.totalAmount, 0));
        setLoaded((prev) => ({ ...prev, revenue: true }));
      });

    // Settled = splits where user already paid their share (as payer or repaid debtor)
    const paidSub = database
      .get<TransactionSplit>('transaction_splits')
      .query(
        Q.where('user_id', userId),
        Q.or(Q.where('is_payer', true), Q.where('paid_to_payer', true)),
        Q.where('is_deleted', false),
      )
      .observe()
      .subscribe((splits) => {
        setPaid(splits.reduce((sum, s) => sum + s.shareAmount, 0));
        setLoaded((prev) => ({ ...prev, paid: true }));
      });

    return () => {
      personalSub.unsubscribe();
      groupSub.unsubscribe();
      revenueSub.unsubscribe();
      paidSub.unsubscribe();
    };
  }, [userId]);

  const loading = !loaded.personal || !loaded.group || !loaded.revenue || !loaded.paid;

  return {
    total: personal + group,
    personal,
    group,
    balance: revenue - paid,
    loading,
  };
}
