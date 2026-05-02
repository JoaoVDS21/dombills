import { Skeleton } from '@/components/ui/skeleton';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { useHomeStats } from '@/hooks/useHomeStats';
import { formatBRL } from '@/lib/format';
import { cn } from '@/lib/utils';
import { Eye, EyeOff } from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, View } from 'react-native';

type PendingCardProps = {
  userId: string;
  className?: string;
};

function PendingCardSkeleton({ className }: { className?: string }) {
  return (
    <View className={cn('mx-5 rounded-2xl bg-blue-950 p-5', className)}>
      <View className="flex-row justify-between">
        <View>
          <Skeleton className="mb-2 h-3 w-20 bg-blue-900" />
          <Skeleton className="mb-4 h-9 w-36 bg-blue-900" />
          <View className="flex-row gap-4">
            <Skeleton className="h-4 w-20 bg-blue-900" />
            <Skeleton className="h-4 w-20 bg-blue-900" />
          </View>
        </View>
        <View className="items-end gap-2">
          <Skeleton className="h-3 w-14 bg-blue-900" />
          <Skeleton className="h-5 w-24 bg-blue-900" />
        </View>
      </View>
    </View>
  );
}

function PendingCard({ userId, className }: PendingCardProps) {
  const { total, personal, group, balance, loading } = useHomeStats(userId);
  const [balanceHidden, setBalanceHidden] = useState(false);

  if (loading) return <PendingCardSkeleton className={className} />;

  return (
    <View className={cn('mx-5 rounded-2xl bg-blue-950 p-5', className)}>
      <View className="flex-row justify-between">
        {/* Left — pendências */}
        <View className="mr-4 flex-1">
          <Text className="mb-1 text-xs uppercase tracking-wide text-blue-300">
            Pendências
          </Text>
          <Text className="mb-4 text-3xl font-bold text-white">{formatBRL(total)}</Text>
          <View className="flex-row items-center gap-4">
            <View>
              <Text className="mb-0.5 text-xs text-blue-300">Pessoais</Text>
              <Text className="text-sm font-semibold text-white">{formatBRL(personal)}</Text>
            </View>
            <View className="h-6 w-px bg-blue-800" />
            <View>
              <Text className="mb-0.5 text-xs text-blue-300">Grupos</Text>
              <Text className="text-sm font-semibold text-white">{formatBRL(group)}</Text>
            </View>
          </View>
        </View>

        {/* Right — saldo atual */}
        <View className="items-end">
          <View className="mb-1 flex-row items-center gap-1.5">
            <Text className="text-xs uppercase tracking-wide text-blue-300">Saldo</Text>
            <Pressable onPress={() => setBalanceHidden((v) => !v)} hitSlop={8}>
              <Icon
                as={balanceHidden ? EyeOff : Eye}
                size={14}
                className="text-blue-300"
              />
            </Pressable>
          </View>
          <Text
            className={cn(
              'text-base font-bold',
              balanceHidden ? 'text-blue-300' : balance >= 0 ? 'text-green-400' : 'text-red-400',
            )}
          >
            {balanceHidden ? '•••••' : formatBRL(balance)}
          </Text>
        </View>
      </View>
    </View>
  );
}

export { PendingCard };
