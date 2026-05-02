import { database } from '@/lib/database';
import { Category } from '@/lib/database/models/Category';
import { PaymentMethod } from '@/lib/database/models/PaymentMethod';
import { Transaction } from '@/lib/database/models/Transaction';
import { Q } from '@nozbe/watermelondb';
import { useEffect, useState } from 'react';

export type AnalysisItem = { name: string; color: string; total: number };
export type AnalysisPayment = { name: string; total: number };

export function useQuickAnalysis(userId: string) {
  const [byCategory, setByCategory] = useState<AnalysisItem[]>([]);
  const [byPayment, setByPayment] = useState<AnalysisPayment[]>([]);

  useEffect(() => {
    if (!userId) return;

    const sub = database
      .get<Transaction>('transactions')
      .query(
        Q.where('type', 'EXPENSE'),
        Q.where('created_by', userId),
        Q.where('is_deleted', false),
      )
      .observe()
      .subscribe(async (txs) => {
        if (txs.length === 0) {
          setByCategory([]);
          setByPayment([]);
          return;
        }

        const catIds = [...new Set(txs.map((t) => t.categoryId).filter(Boolean))];
        const pmIds = [...new Set(txs.map((t) => t.paymentMethodId).filter(Boolean))];

        const [cats, pms] = await Promise.all([
          catIds.length > 0
            ? database.get<Category>('categories').query(Q.where('id', Q.oneOf(catIds))).fetch()
            : Promise.resolve([] as Category[]),
          pmIds.length > 0
            ? database
                .get<PaymentMethod>('payment_methods')
                .query(Q.where('id', Q.oneOf(pmIds)))
                .fetch()
            : Promise.resolve([] as PaymentMethod[]),
        ]);

        const catMap = Object.fromEntries(cats.map((c) => [c.id, c]));
        const pmMap = Object.fromEntries(pms.map((pm) => [pm.id, pm]));

        const catAgg: Record<string, AnalysisItem> = {};
        const pmAgg: Record<string, AnalysisPayment> = {};

        for (const tx of txs) {
          const cat = catMap[tx.categoryId];
          if (cat) {
            catAgg[tx.categoryId] ??= { name: cat.name, color: cat.color, total: 0 };
            catAgg[tx.categoryId].total += tx.totalAmount;
          }
          const pm = pmMap[tx.paymentMethodId];
          if (pm) {
            pmAgg[tx.paymentMethodId] ??= { name: pm.name, total: 0 };
            pmAgg[tx.paymentMethodId].total += tx.totalAmount;
          }
        }

        setByCategory(Object.values(catAgg).sort((a, b) => b.total - a.total).slice(0, 5));
        setByPayment(Object.values(pmAgg).sort((a, b) => b.total - a.total).slice(0, 4));
      });

    return () => sub.unsubscribe();
  }, [userId]);

  return { byCategory, byPayment };
}
