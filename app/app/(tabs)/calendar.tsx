import { MonthCalendar } from '@/components/features/calendar/MonthCalendar';
import { TransactionListItem } from '@/components/features/calendar/TransactionListItem';
import { ChipGroup } from '@/components/ui/chip-group';
import { Skeleton } from '@/components/ui/skeleton';
import { Text } from '@/components/ui/text';
import { useAuth } from '@/contexts/auth';
import { useCategories } from '@/hooks/useCategories';
import { useTransactionsByPeriod } from '@/hooks/useTransactionsByPeriod';
import type { Transaction } from '@/lib/database/models/Transaction';
import { X } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type ViewMode = 'monthly' | 'custom';
type FilterType = 'all' | 'expense' | 'revenue';

const VIEW_MODE_OPTIONS: { value: ViewMode; label: string }[] = [
  { value: 'monthly', label: 'Mensal' },
  { value: 'custom', label: 'Personalizado' },
];

const FILTER_OPTIONS: { value: FilterType; label: string }[] = [
  { value: 'all', label: 'Ambos' },
  { value: 'expense', label: 'Despesas' },
  { value: 'revenue', label: 'Receitas' },
];

function startOfMonth(year: number, month: number) {
  return new Date(year, month, 1, 0, 0, 0, 0).getTime();
}

function endOfMonth(year: number, month: number) {
  return new Date(year, month + 1, 0, 23, 59, 59, 999).getTime();
}

function startOfDay(ts: number) {
  const d = new Date(ts);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

function endOfDay(ts: number) {
  const d = new Date(ts);
  d.setHours(23, 59, 59, 999);
  return d.getTime();
}

export default function CalendarScreen() {
  const { user } = useAuth();
  const insets = useSafeAreaInsets();

  const now = new Date();
  const [viewMode, setViewMode] = useState<ViewMode>('monthly');
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [rangeStart, setRangeStart] = useState<number | null>(null);
  const [rangeEnd, setRangeEnd] = useState<number | null>(null);
  const [filterType, setFilterType] = useState<FilterType>('all');

  const { categories } = useCategories(user?.id ?? '');

  const categoryMap = useMemo(
    () => Object.fromEntries(categories.map((c) => [c.id, c])),
    [categories],
  );

  // Determine query period
  const periodStart = viewMode === 'monthly'
    ? startOfMonth(year, month)
    : rangeStart ?? startOfMonth(year, month);
  const periodEnd = viewMode === 'monthly'
    ? endOfMonth(year, month)
    : rangeEnd ?? endOfMonth(year, month);

  const { transactions, loading } = useTransactionsByPeriod(
    user?.id ?? '',
    periodStart,
    periodEnd,
  );

  // Build dots map for calendar
  const dotsByDate = useMemo(() => {
    const map: Record<string, Set<'expense' | 'revenue'>> = {};
    for (const tx of transactions) {
      const d = new Date(tx.date);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      if (!map[key]) map[key] = new Set();
      map[key].add(tx.type === 'EXPENSE' ? 'expense' : 'revenue');
    }
    return map;
  }, [transactions]);

  // Filter transactions for the list
  const filteredTransactions = useMemo(() => {
    let txs: Transaction[] = transactions;

    // Day filter (monthly mode only)
    if (viewMode === 'monthly' && selectedDay !== null) {
      const dayStart = startOfDay(selectedDay);
      const dayEnd = endOfDay(selectedDay);
      txs = txs.filter((tx) => tx.date >= dayStart && tx.date <= dayEnd);
    }

    // Type filter
    if (filterType === 'expense') txs = txs.filter((tx) => tx.type === 'EXPENSE');
    if (filterType === 'revenue') txs = txs.filter((tx) => tx.type === 'REVENUE');

    return txs;
  }, [transactions, selectedDay, filterType, viewMode]);

  function handleDayPress(ts: number) {
    if (viewMode === 'monthly') {
      setSelectedDay((prev) => (prev && startOfDay(prev) === startOfDay(ts) ? null : ts));
      return;
    }
    // Custom range mode
    if (!rangeStart || (rangeStart && rangeEnd)) {
      setRangeStart(ts);
      setRangeEnd(null);
    } else {
      if (ts >= rangeStart) setRangeEnd(ts);
      else { setRangeEnd(rangeStart); setRangeStart(ts); }
    }
  }

  function handleMonthChange(y: number, m: number) {
    setYear(y);
    setMonth(m);
    if (viewMode === 'monthly') setSelectedDay(null);
  }

  const selectedDateLabel = useMemo(() => {
    if (!selectedDay) return null;
    return new Date(selectedDay).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
    });
  }, [selectedDay]);

  if (!user) return null;

  return (
    <ScrollView
      className="flex-1 bg-background"
      contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}
    >
      {/* Header */}
      <View
        className="px-5 pb-4"
        style={{ paddingTop: insets.top + 16 }}
      >
        <Text variant="h3">Fluxo de Caixa</Text>
      </View>

      {/* View mode switch */}
      <View className="mx-5 mb-5 flex-row rounded-xl bg-muted p-1">
        {VIEW_MODE_OPTIONS.map((opt) => (
          <Pressable
            key={opt.value}
            onPress={() => {
              setViewMode(opt.value);
              setSelectedDay(null);
              setRangeStart(null);
              setRangeEnd(null);
            }}
            className={`flex-1 items-center rounded-lg py-2.5 ${viewMode === opt.value ? 'bg-card' : ''}`}
          >
            <Text
              className={`text-sm font-medium ${viewMode === opt.value ? 'text-foreground' : 'text-muted-foreground'}`}
            >
              {opt.label}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* Calendar */}
      <View className="mb-5 rounded-2xl border border-border bg-card mx-5 py-4">
        <MonthCalendar
          year={year}
          month={month}
          mode={viewMode === 'monthly' ? 'single' : 'range'}
          selectedDay={viewMode === 'monthly' ? selectedDay : undefined}
          rangeStart={viewMode === 'custom' ? rangeStart : undefined}
          rangeEnd={viewMode === 'custom' ? rangeEnd : undefined}
          dotsByDate={dotsByDate}
          onDayPress={handleDayPress}
          onMonthChange={handleMonthChange}
        />
      </View>

      {/* Selected day indicator (monthly mode) */}
      {viewMode === 'monthly' && selectedDay && (
        <View className="mx-5 mb-4 flex-row items-center justify-between rounded-xl border border-border bg-card px-4 py-2.5">
          <Text className="text-sm font-medium text-foreground">{selectedDateLabel}</Text>
          <Pressable onPress={() => setSelectedDay(null)} hitSlop={8} className="active:opacity-70">
            <X size={16} color="#94a3b8" />
          </Pressable>
        </View>
      )}

      {/* Filter chips */}
      <ChipGroup
        options={FILTER_OPTIONS}
        value={filterType}
        onChange={setFilterType}
        className="mb-5"
      />

      {/* Transaction list */}
      {loading ? (
        <View className="mx-5 gap-3">
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-14 w-full rounded-xl" />
          ))}
        </View>
      ) : filteredTransactions.length === 0 ? (
        <View className="mx-5 items-center rounded-2xl border border-dashed border-border py-10">
          <Text variant="muted" className="text-sm">
            Nenhuma transação neste período
          </Text>
        </View>
      ) : (
        <View className="mx-5 rounded-2xl border border-border bg-card px-4">
          {filteredTransactions.map((tx) => (
            <TransactionListItem
              key={tx.id}
              transaction={tx}
              categoryName={categoryMap[tx.categoryId]?.name}
              categoryColor={categoryMap[tx.categoryId]?.color}
            />
          ))}
        </View>
      )}
    </ScrollView>
  );
}
