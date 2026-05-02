import { database } from '@/lib/database';
import { Group } from '@/lib/database/models/Group';
import { Q } from '@nozbe/watermelondb';
import { useEffect, useState } from 'react';

export function useUserGroups(userId: string) {
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;

    setLoading(true);

    const sub = database
      .get<Group>('groups')
      .query(
        Q.on('group_members', [
          Q.where('user_id', userId),
          Q.where('is_deleted', false),
        ]),
        Q.where('is_deleted', false),
      )
      .observe()
      .subscribe((result) => {
        setGroups(result);
        setLoading(false);
      });

    return () => sub.unsubscribe();
  }, [userId]);

  return { groups, loading };
}
