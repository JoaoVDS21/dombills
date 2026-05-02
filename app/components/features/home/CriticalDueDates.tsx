import { Icon } from '@/components/ui/icon';
import { Skeleton } from '@/components/ui/skeleton';
import { Text } from '@/components/ui/text';
import { useCriticalDueDates } from '@/hooks/useCriticalDueDates';
import type { Transaction } from '@/lib/database/models/Transaction';
import { formatBRL, formatShortDate } from '@/lib/format';
import { cn } from '@/lib/utils';
import { useRouter } from 'expo-router';
import { AlertCircle, Calendar } from 'lucide-react-native';
import { Pressable, View } from 'react-native';

function isOverdue(dueDate: number): boolean {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return dueDate < today.getTime();
}

function isDueToday(dueDate: number): boolean {
  const today = new Date();
  const due = new Date(dueDate);
  return (
    today.getFullYear() === due.getFullYear() &&
    today.getMonth() === due.getMonth() &&
    today.getDate() === due.getDate()
  );
}

function DueItem({ tx }: { tx: Transaction }) {
  const overdue = isOverdue(tx.dueDate);
  const today = isDueToday(tx.dueDate);

  return (
    <View className="flex-row items-center justify-between border-b border-border py-3 last:border-0">
      <View className="mr-2 flex-1 flex-row items-center gap-3">
        <Icon
          as={overdue || today ? AlertCircle : Calendar}
          size={16}
          className={cn(
            overdue ? 'text-red-500' : today ? 'text-orange-400' : 'text-muted-foreground',
          )}
        />
        <View className="flex-1">
          <Text className="text-sm font-medium text-foreground" numberOfLines={1}>
            {tx.description}
          </Text>
          <Text
            className={cn(
              'text-xs',
              overdue ? 'text-red-500' : today ? 'text-orange-400' : 'text-muted-foreground',
            )}
          >
            {overdue ? 'Vencida em ' : today ? 'Vence hoje' : 'Vence em '}
            {!today && formatShortDate(tx.dueDate)}
          </Text>
        </View>
      </View>
      <Text className="text-sm font-semibold text-foreground">{formatBRL(tx.totalAmount)}</Text>
    </View>
  );
}

type CriticalDueDatesProps = { userId: string };

export function CriticalDueDates({ userId }: CriticalDueDatesProps) {
  const { transactions, loading } = useCriticalDueDates(userId);
  const router = useRouter();

  if (loading) {
    return (
      <View className="mx-5 gap-3">
        {[0, 1, 2].map((i) => (
          <Skeleton key={i} className="h-14 w-full rounded-xl" />
        ))}
      </View>
    );
  }

  if (transactions.length === 0) {
    return (
      <View className="mx-5 items-center rounded-2xl border border-dashed border-border py-8">
        <Text variant="muted" className="text-sm">
          Nenhuma despesa pendente
        </Text>
      </View>
    );
  }

  return (
    <View className="mx-5 rounded-2xl border border-border bg-card px-4">
      {transactions.map((tx) => (
        <DueItem key={tx.id} tx={tx} />
      ))}
      <Pressable
        className="items-center py-3 active:opacity-70"
        onPress={() => router.push('/expenses' as any)}
      >
        <Text className="text-sm font-medium text-primary">Ver Todas</Text>
      </Pressable>
    </View>
  );
}
