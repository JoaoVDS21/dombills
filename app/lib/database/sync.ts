import { synchronize } from '@nozbe/watermelondb/sync';
import { database } from './index';
import { getToken } from '../api';

const BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000/api';

export async function syncDatabase() {
  const token = await getToken();
  if (!token) return;

  await synchronize({
    database,
    sendCreatedAsUpdated: true,
    pullChanges: async ({ lastPulledAt }) => {
      const res = await fetch(`${BASE_URL}/sync/pull?lastPulledAt=${lastPulledAt ?? 0}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Pull failed');
      return res.json();
    },
    pushChanges: async ({ changes, lastPulledAt }) => {
      const res = await fetch(`${BASE_URL}/sync/push`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ changes, lastPulledAt }),
      });
      if (!res.ok) throw new Error('Push failed');
    },
  });
}
