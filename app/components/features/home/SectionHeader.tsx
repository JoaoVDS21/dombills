import { Text } from '@/components/ui/text';
import { cn } from '@/lib/utils';
import { Pressable, View, type ViewProps } from 'react-native';

type SectionHeaderProps = ViewProps & {
  title: string;
  actionLabel?: string;
  onAction?: () => void;
};

function SectionHeader({ title, actionLabel, onAction, className, ...props }: SectionHeaderProps) {
  return (
    <View
      className={cn('flex-row items-center justify-between px-5', className)}
      {...props}
    >
      <Text variant="h4">{title}</Text>
      {actionLabel && (
        <Pressable onPress={onAction} className="py-1">
          <Text className="text-sm font-medium text-primary">{actionLabel}</Text>
        </Pressable>
      )}
    </View>
  );
}

export { SectionHeader };
