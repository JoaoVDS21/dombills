import { Skeleton } from '@/components/ui/skeleton';
import { Text } from '@/components/ui/text';
import { useUserGroups } from '@/hooks/useUserGroups';
import type { Group } from '@/lib/database/models/Group';
import { useRouter } from 'expo-router';
import { FlatList, View } from 'react-native';
import { GroupCard } from './GroupCard';

function GroupCarouselSkeleton() {
  return (
    <View className="flex-row px-5">
      {[0, 1, 2].map((i) => (
        <Skeleton key={i} className="mr-3 h-[108px] w-36" />
      ))}
    </View>
  );
}

function EmptyGroups() {
  return (
    <View className="ml-5 h-[108px] w-36 items-center justify-center rounded-2xl border border-dashed border-border">
      <Text variant="muted" className="text-xs text-center px-2">
        Nenhum grupo ainda
      </Text>
    </View>
  );
}

type GroupCarouselProps = {
  userId: string;
};

function GroupCarousel({ userId }: GroupCarouselProps) {
  const { groups, loading } = useUserGroups(userId);
  const router = useRouter();

  if (loading) return <GroupCarouselSkeleton />;

  return (
    <FlatList<Group>
      horizontal
      data={groups}
      keyExtractor={(g) => g.id}
      contentContainerStyle={{ paddingHorizontal: 20 }}
      showsHorizontalScrollIndicator={false}
      renderItem={({ item }) => (
        <GroupCard
          group={item}
          onPress={() => router.push(`/groups/${item.id}` as any)}
        />
      )}
      ListEmptyComponent={<EmptyGroups />}
    />
  );
}

export { GroupCarousel };
