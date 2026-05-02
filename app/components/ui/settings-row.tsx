import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { cn } from '@/lib/utils';
import { ChevronRight, type LucideIcon } from 'lucide-react-native';
import { type ReactNode } from 'react';
import { Pressable, View } from 'react-native';

type SettingsRowProps = {
  label: string;
  icon?: LucideIcon;
  iconBg?: string;
  value?: string;
  onPress?: () => void;
  rightElement?: ReactNode;
  destructive?: boolean;
  showChevron?: boolean;
  className?: string;
};

export function SettingsRow({
  label,
  icon,
  iconBg = '#3b82f6',
  value,
  onPress,
  rightElement,
  destructive = false,
  showChevron = true,
  className,
}: SettingsRowProps) {
  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress && !rightElement}
      className={cn(
        'flex-row items-center gap-3 px-5 py-4 active:opacity-70',
        className,
      )}
    >
      {icon && (
        <View
          className="h-9 w-9 items-center justify-center rounded-xl"
          style={{ backgroundColor: iconBg }}
        >
          <Icon as={icon} size={18} className="text-white" />
        </View>
      )}

      <View className="flex-1">
        <Text
          className={cn(
            'text-base font-medium',
            destructive ? 'text-destructive' : 'text-foreground',
          )}
        >
          {label}
        </Text>
        {value && (
          <Text variant="muted" className="text-sm">
            {value}
          </Text>
        )}
      </View>

      {rightElement ?? (onPress && showChevron ? (
        <Icon as={ChevronRight} size={16} className="text-muted-foreground" />
      ) : null)}
    </Pressable>
  );
}
