import { database } from '@/lib/database';
import { Category } from '@/lib/database/models/Category';
import { Q } from '@nozbe/watermelondb';
import { useEffect, useState } from 'react';

export function useCategories(userId: string) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;

    const sub = database
      .get<Category>('categories')
      .query(
        Q.where('is_deleted', false),
        Q.or(Q.where('user_id', userId), Q.where('user_id', null)),
      )
      .observe()
      .subscribe((result) => {
        setCategories(result);
        setLoading(false);
      });

    return () => sub.unsubscribe();
  }, [userId]);

  return { categories, loading };
}
