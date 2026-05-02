import { Skeleton } from '@/components/ui/skeleton';
import { Text } from '@/components/ui/text';
import { useUserGroups } from '@/hooks/useUserGroups';
import type { Group } from '@/lib/database/models/Group';
import { cn } from '@/lib/utils';
import { useRouter } from 'expo-router';
import { FlatList, View } from 'react-native';
import { GroupCard } from './GroupCard';

function GroupCarouselSkeleton() {
  return (
    <View className="flex-row px-5">
      {[0, 1, 2].map((i) => (
        <Skeleton key={i} className="mr-3 h-[172px] w-44" />
      ))}
    </View>
  );
}

function EmptyGroups() {
  return (
    <View className="ml-5 h-[172px] w-44 items-center justify-center rounded-2xl border border-dashed border-border">
      <Text variant="muted" className="px-2 text-center text-xs">
        Nenhum grupo ainda
      </Text>
    </View>
  );
}

type GroupCarouselProps = {
  userId: string;
  className?: string;
};

function GroupCarousel({ userId, className }: GroupCarouselProps) {
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
      className={cn(className)}
      renderItem={({ item }) => (
        <GroupCard
          group={item}
          userId={userId}
          onPress={() => router.push(`/groups/${item.id}` as any)}
        />
      )}
      ListEmptyComponent={<EmptyGroups />}
    />
  );
}

export { GroupCarousel };
