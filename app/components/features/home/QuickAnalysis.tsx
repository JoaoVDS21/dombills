import { Skeleton } from '@/components/ui/skeleton';
import { Text } from '@/components/ui/text';
import { useQuickAnalysis, type AnalysisItem, type AnalysisPayment } from '@/hooks/useQuickAnalysis';
import { formatBRL } from '@/lib/format';
import { View } from 'react-native';

type BarProps = {
  name: string;
  total: number;
  maxTotal: number;
  color?: string;
};

function AnalysisBar({ name, total, maxTotal, color }: BarProps) {
  const pct = maxTotal > 0 ? (total / maxTotal) * 100 : 0;

  return (
    <View className="mb-3">
      <View className="mb-1.5 flex-row justify-between">
        <Text className="text-sm text-foreground" numberOfLines={1}>
          {name}
        </Text>
        <Text className="text-sm font-medium text-foreground">{formatBRL(total)}</Text>
      </View>
      <View className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
        <View
          className="h-full rounded-full"
          style={{ width: `${pct}%`, backgroundColor: color ?? '#3b82f6' }}
        />
      </View>
    </View>
  );
}

type QuickAnalysisProps = { userId: string };

export function QuickAnalysis({ userId }: QuickAnalysisProps) {
  const { byCategory, byPayment } = useQuickAnalysis(userId);

  const maxCat = Math.max(...byCategory.map((c) => c.total), 0);
  const maxPm = Math.max(...byPayment.map((p) => p.total), 0);

  if (byCategory.length === 0 && byPayment.length === 0) return null;

  return (
    <View className="gap-6 px-5">
      {byCategory.length > 0 && (
        <View className="rounded-2xl border border-border bg-card p-4">
          <Text variant="h4" className="mb-4">
            Por Categoria
          </Text>
          {byCategory.map((item: AnalysisItem) => (
            <AnalysisBar
              key={item.name}
              name={item.name}
              total={item.total}
              maxTotal={maxCat}
              color={item.color}
            />
          ))}
        </View>
      )}
      {byPayment.length > 0 && (
        <View className="rounded-2xl border border-border bg-card p-4">
          <Text variant="h4" className="mb-4">
            Por Pagamento
          </Text>
          {byPayment.map((item: AnalysisPayment) => (
            <AnalysisBar
              key={item.name}
              name={item.name}
              total={item.total}
              maxTotal={maxPm}
            />
          ))}
        </View>
      )}
    </View>
  );
}
