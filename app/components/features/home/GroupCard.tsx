import { Skeleton } from '@/components/ui/skeleton';
import { Text } from '@/components/ui/text';
import { useGroupStats } from '@/hooks/useGroupStats';
import { formatBRL } from '@/lib/format';
import type { Group } from '@/lib/database/models/Group';
import { Image, Pressable, View } from 'react-native';

type GroupCardProps = {
  group: Group;
  userId: string;
  onPress?: () => void;
};

function GroupCardSkeleton() {
  return <Skeleton className="mr-3 h-[172px] w-44 rounded-2xl" />;
}

function GroupCard({ group, userId, onPress }: GroupCardProps) {
  const { groupTotal, userShare, userPaid, loading } = useGroupStats(group.id, userId);

  if (loading) return <GroupCardSkeleton />;

  return (
    <Pressable
      className="mr-3 w-44 overflow-hidden rounded-2xl active:opacity-80"
      onPress={onPress}
    >
      {/* Colored background */}
      <View className="absolute inset-0" style={{ backgroundColor: group.hexColor }} />
      {/* Dark overlay for readability */}
      <View className="absolute inset-0 bg-black/55" />

      {group.imagePath && (
        <Image
          source={{ uri: group.imagePath }}
          className="absolute inset-0 h-full w-full"
          resizeMode="cover"
        />
      )}

      <View className="p-4">
        <View className="mb-3 h-10 w-10 items-center justify-center rounded-full bg-white/20">
          <Text className="text-base font-bold text-white">
            {group.name.charAt(0).toUpperCase()}
          </Text>
        </View>

        <Text className="mb-3 text-sm font-bold text-white" numberOfLines={1}>
          {group.name}
        </Text>

        <View className="gap-1">
          <View className="flex-row justify-between">
            <Text className="text-xs text-white/60">Total grupo</Text>
            <Text className="text-xs font-medium text-white">{formatBRL(groupTotal)}</Text>
          </View>
          <View className="flex-row justify-between">
            <Text className="text-xs text-white/60">Sua parte</Text>
            <Text className="text-xs font-medium text-white">{formatBRL(userShare)}</Text>
          </View>
          <View className="flex-row justify-between">
            <Text className="text-xs text-white/60">Já pago</Text>
            <Text className="text-xs font-medium text-green-300">{formatBRL(userPaid)}</Text>
          </View>
        </View>
      </View>
    </Pressable>
  );
}

export { GroupCard };
