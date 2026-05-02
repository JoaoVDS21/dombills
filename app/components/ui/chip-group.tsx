import { Text } from '@/components/ui/text';
import { cn } from '@/lib/utils';
import { Pressable, ScrollView } from 'react-native';

type Option<T extends string> = {
  value: T;
  label: string;
};

type ChipGroupProps<T extends string> = {
  options: Option<T>[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
};

export function ChipGroup<T extends string>({
  options,
  value,
  onChange,
  className,
}: ChipGroupProps<T>) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ gap: 8, paddingHorizontal: 20 }}
      className={className}
    >
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <Pressable
            key={opt.value}
            onPress={() => onChange(opt.value)}
            className={cn(
              'rounded-full px-4 py-2 active:opacity-70',
              active ? 'bg-primary' : 'border border-border bg-card',
            )}
          >
            <Text
              className={cn(
                'text-sm font-medium',
                active ? 'text-primary-foreground' : 'text-foreground',
              )}
            >
              {opt.label}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}
