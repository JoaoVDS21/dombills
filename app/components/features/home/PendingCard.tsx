import { Skeleton } from '@/components/ui/skeleton';
import { Text } from '@/components/ui/text';
import { useHomeStats } from '@/hooks/useHomeStats';
import { cn } from '@/lib/utils';
import { View } from 'react-native';

function formatBRL(value: number) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

type PendingCardProps = {
  userId: string;
  className?: string;
};

function PendingCardSkeleton({ className }: { className?: string }) {
  return (
    <View className={cn('mx-5 rounded-2xl border border-border bg-card p-5', className)}>
      <Skeleton className="mb-3 h-3.5 w-20" />
      <Skeleton className="mb-5 h-9 w-44" />
      <View className="flex-row gap-6">
        <View className="gap-1.5">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-5 w-24" />
        </View>
        <View className="w-px bg-border" />
        <View className="gap-1.5">
          <Skeleton className="h-3 w-12" />
          <Skeleton className="h-5 w-24" />
        </View>
      </View>
    </View>
  );
}

function PendingCard({ userId, className }: PendingCardProps) {
  const { total, personal, group, loading } = useHomeStats(userId);

  if (loading) return <PendingCardSkeleton className={className} />;

  return (
    <View className={cn('mx-5 rounded-2xl border border-border bg-card p-5', className)}>
      <Text variant="muted" className="mb-1 text-xs uppercase tracking-wide">
        Pendências
      </Text>
      <Text className="mb-5 text-3xl font-bold text-foreground">{formatBRL(total)}</Text>
      <View className="flex-row items-center gap-6">
        <View>
          <Text variant="muted" className="mb-0.5 text-xs">Pessoais</Text>
          <Text className="text-base font-semibold text-foreground">{formatBRL(personal)}</Text>
        </View>
        <View className="h-8 w-px bg-border" />
        <View>
          <Text variant="muted" className="mb-0.5 text-xs">Grupos</Text>
          <Text className="text-base font-semibold text-foreground">{formatBRL(group)}</Text>
        </View>
      </View>
    </View>
  );
}

export { PendingCard };
