import { database } from '@/lib/database';
import { TransactionSplit } from '@/lib/database/models/TransactionSplit';
import { Q } from '@nozbe/watermelondb';
import { useEffect, useState } from 'react';

export function useHomeStats(userId: string) {
  const [personal, setPersonal] = useState(0);
  const [group, setGroup] = useState(0);
  const [personalLoaded, setPersonalLoaded] = useState(false);
  const [groupLoaded, setGroupLoaded] = useState(false);

  useEffect(() => {
    if (!userId) return;

    setPersonalLoaded(false);
    setGroupLoaded(false);

    const personalSub = database
      .get<TransactionSplit>('transaction_splits')
      .query(
        Q.where('user_id', userId),
        Q.where('paid_to_payer', false),
        Q.where('is_deleted', false),
        Q.on('transactions', [
          Q.where('is_deleted', false),
          Q.where('group_id', null),
        ]),
      )
      .observe()
      .subscribe((splits) => {
        setPersonal(splits.reduce((sum, s) => sum + s.shareAmount, 0));
        setPersonalLoaded(true);
      });

    const groupSub = database
      .get<TransactionSplit>('transaction_splits')
      .query(
        Q.where('user_id', userId),
        Q.where('paid_to_payer', false),
        Q.where('is_deleted', false),
        Q.on('transactions', [
          Q.where('is_deleted', false),
          Q.where('group_id', Q.notEq(null)),
        ]),
      )
      .observe()
      .subscribe((splits) => {
        setGroup(splits.reduce((sum, s) => sum + s.shareAmount, 0));
        setGroupLoaded(true);
      });

    return () => {
      personalSub.unsubscribe();
      groupSub.unsubscribe();
    };
  }, [userId]);

  return {
    total: personal + group,
    personal,
    group,
    loading: !personalLoaded || !groupLoaded,
  };
}
