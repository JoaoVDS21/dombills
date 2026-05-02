import { Text } from '@/components/ui/text';
import type { Group } from '@/lib/database/models/Group';
import { Image, Pressable, View } from 'react-native';

type GroupCardProps = {
  group: Group;
  onPress?: () => void;
};

function GroupCard({ group, onPress }: GroupCardProps) {
  return (
    <Pressable
      className="mr-3 w-36 rounded-2xl border border-border bg-card p-4 active:opacity-70"
      onPress={onPress}
    >
      <View
        className="mb-3 h-10 w-10 items-center justify-center rounded-full"
        style={{ backgroundColor: group.hexColor }}
      >
        {group.imagePath ? (
          <Image
            source={{ uri: group.imagePath }}
            className="h-10 w-10 rounded-full"
            resizeMode="cover"
          />
        ) : (
          <Text className="text-base font-bold text-white">
            {group.name.charAt(0).toUpperCase()}
          </Text>
        )}
      </View>
      <Text className="text-sm font-semibold text-foreground" numberOfLines={2}>
        {group.name}
      </Text>
    </Pressable>
  );
}

export { GroupCard };
