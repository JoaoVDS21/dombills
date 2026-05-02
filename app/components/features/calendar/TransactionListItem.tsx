import { Text } from '@/components/ui/text';
import type { Transaction } from '@/lib/database/models/Transaction';
import { formatBRL, formatShortDate } from '@/lib/format';
import { cn } from '@/lib/utils';
import { View } from 'react-native';

type TransactionListItemProps = {
  transaction: Transaction;
  categoryName?: string;
  categoryColor?: string;
};

export function TransactionListItem({
  transaction,
  categoryName,
  categoryColor,
}: TransactionListItemProps) {
  const isRevenue = transaction.type === 'REVENUE';
  const dotColor = categoryColor ?? (isRevenue ? '#22c55e' : '#ef4444');

  return (
    <View className="flex-row items-center gap-3 border-b border-border py-3.5 last:border-0">
      <View
        className="h-3 w-3 flex-shrink-0 rounded-full"
        style={{ backgroundColor: dotColor }}
      />

      <View className="flex-1">
        <Text
          className="text-sm font-medium text-foreground"
          numberOfLines={1}
        >
          {transaction.description}
        </Text>
        <Text className="mt-0.5 text-xs text-muted-foreground">
          {categoryName ?? (isRevenue ? 'Receita' : 'Despesa')}
          {' · '}
          {formatShortDate(transaction.date)}
        </Text>
      </View>

      <Text
        className={cn(
          'text-sm font-semibold',
          isRevenue ? 'text-green-400' : 'text-red-400',
        )}
      >
        {isRevenue ? '+' : '-'}
        {formatBRL(transaction.totalAmount)}
      </Text>
    </View>
  );
}
