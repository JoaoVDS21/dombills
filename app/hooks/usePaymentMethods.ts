import { database } from '@/lib/database';
import { PaymentMethod } from '@/lib/database/models/PaymentMethod';
import { Q } from '@nozbe/watermelondb';
import { useEffect, useState } from 'react';

export function usePaymentMethods(userId: string) {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;

    const sub = database
      .get<PaymentMethod>('payment_methods')
      .query(
        Q.where('is_deleted', false),
        Q.where('user_id', userId),
      )
      .observe()
      .subscribe((result) => {
        setPaymentMethods(result);
        setLoading(false);
      });

    return () => sub.unsubscribe();
  }, [userId]);

  return { paymentMethods, loading };
}
