import { GroupCarousel } from '@/components/features/home/GroupCarousel';
import { PendingCard } from '@/components/features/home/PendingCard';
import { SectionHeader } from '@/components/features/home/SectionHeader';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { useAuth } from '@/contexts/auth';
import { syncDatabase } from '@/lib/database/sync';
import { RotateCw } from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, RefreshControl, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function HomeScreen() {
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const [syncing, setSyncing] = useState(false);

  async function handleSync() {
    if (syncing) return;
    setSyncing(true);
    try {
      await syncDatabase();
    } finally {
      setSyncing(false);
    }
  }

  if (!user) return null;

  const firstName = user.name.split(' ')[0];

  return (
    <ScrollView
      className="flex-1 bg-background"
      contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}
      refreshControl={<RefreshControl refreshing={syncing} onRefresh={handleSync} />}
    >
      {/* Header */}
      <View
        className="flex-row items-center justify-between px-5 pb-4"
        style={{ paddingTop: insets.top + 16 }}
      >
        <View>
          <Text variant="muted" className="text-xs">Bem-vindo</Text>
          <Text variant="h3">{firstName}</Text>
        </View>
        <Pressable
          onPress={handleSync}
          className="h-10 w-10 items-center justify-center rounded-full border border-border bg-card active:opacity-70"
        >
          <Icon as={RotateCw} size={18} className="text-muted-foreground" />
        </Pressable>
      </View>

      {/* Pending card */}
      <PendingCard userId={user.id} className="mb-6" />

      {/* Groups */}
      <SectionHeader title="Grupos" className="mb-3" />
      <GroupCarousel userId={user.id} />
    </ScrollView>
  );
}
